// eslint-disable-next-line
const Web3 = require('web3');
import { getConnection } from 'typeorm';
import { Command, Console } from 'nestjs-console';
import { Injectable, Logger } from '@nestjs/common';
import { getConfig } from 'src/configs';
import { LatestBlockService } from 'src/modules/latest-block/latest-block.service';
import { crawlBscEvents } from 'src/shares/helpers/bsc';
import { ACCESS_CONTROL_ABI } from 'src/modules/contracts/abi/access-controll-abi';
import { WalletService } from 'src/modules/wallets/wallet.service';
import { WalletStatus } from 'src/modules/wallets/enums/wallet.enum';
import { ContractEvent } from 'src/modules/contracts/constants';
import { HistoryLogService } from 'src/modules/history-log/history-log.service';
import * as config from 'config';
import { CallApi } from 'src/shares/helpers/call-api.helper';
import { UserWallet } from 'src/models/entities/user-wallet.entity';
import { PairService } from 'src/modules/pairs/pair.service';
import { StellarBalance } from 'src/shares/interfaces/stellar-balance';
import { convertToStellarAsset } from 'src/shares/helpers/stellar';
import { sleep } from 'src/shares/helpers/utils';
import { NotificationEntity, NotificationType } from 'src/models/entities/notification.entity';

@Console()
@Injectable()
export class WalletConsole {
  // eslint-disable-next-line
  private web3;
  private listPair;

  constructor(
    private readonly logger: Logger,
    private readonly latestBlockService: LatestBlockService,
    private readonly historyLogService: HistoryLogService,
    private readonly walletService: WalletService,
    private readonly pairService: PairService,
  ) {
    this.logger.setContext(WalletConsole.name);
    const rpcUrl = getConfig().get<string>('rpc_url');
    this.web3 = new Web3();
    this.web3.setProvider(new Web3.providers.HttpProvider(rpcUrl));
  }

  @Command({
    command: 'crawl-role-granted-events',
  })
  async crawlRoleGrantedEvent(): Promise<void> {
    await this.crawlWalletEvents(ContractEvent.RoleGranted, WalletStatus.Approved);
  }

  @Command({
    command: 'crawl-role-revoked-events',
  })
  async crawlRoleRevokedEvent(): Promise<void> {
    await this.crawlWalletEvents(ContractEvent.RoleRevoked, WalletStatus.Blocked);
  }

  private async crawlWalletEvents(eventName: ContractEvent, walletStatus: WalletStatus): Promise<void> {
    const whiteListAddress = getConfig().get<string>('white_list_address');
    const contract = new this.web3.eth.Contract(ACCESS_CONTROL_ABI, whiteListAddress);
    const eventHandler = async (event): Promise<void> => {
      this.logger.log(`Processing event ${JSON.stringify(event)}`);
      const userWallet = await this.walletService.getWalletByAddress(event.returnValues.account);

      if (!userWallet) {
        this.logger.log(`Cannot find wallet ${event.address}`);
        return;
      }

      const status = walletStatus === WalletStatus.Approved ? 'Approved' : 'Blocked';
      const notification = NotificationEntity.createNotification(
        userWallet.user_id,
        NotificationType.Wallet,
        `Your wallet address ${userWallet.address} has been ${status} by Velo admin`,
      );
      userWallet.status = walletStatus;

      await getConnection('master').transaction(async (transaction) => {
        await transaction.save(notification);
        await transaction.save(userWallet);
      });
    };
    await crawlBscEvents(this.web3, this.latestBlockService, contract, eventName, eventHandler);
  }

  @Command({
    command: 'update-whitelist-stellar-addresses',
  })
  async updateWhitelistStellarAddresses(): Promise<void> {
    this.listPair = await this.pairService.getAllPairs();
    while (true) {
      const listStellarWalletPending = await this.walletService.getListStellarAddressPending();
      if (listStellarWalletPending.length === 0) {
        this.logger.log('No stellar wallet pending. Waiting for next');
        await sleep(60000);
        continue;
      }
      for (const wallet of listStellarWalletPending) {
        await this.updateWhitelistStellarAddress(wallet);
        await sleep(1000);
      }
      await sleep(60000);
    }
  }

  async updateWhitelistStellarAddress(wallet: UserWallet): Promise<void> {
    const stellarUrl = config.get<string>('stellar_url');
    const stellarResponse = await CallApi(`${stellarUrl}/accounts/${wallet.address}`, {}, 'GET');
    const operations = (await stellarResponse.json()) || null;
    const isWhitelist = await this.isWhitelistStellar(operations?.balances || []);
    if (!isWhitelist) return;
    this.logger.log(`Whitelist address ${wallet.address}`);
    wallet.status = WalletStatus.Approved;
    wallet.updated_at = new Date();

    const notification = NotificationEntity.createNotification(
      wallet.user_id,
      NotificationType.Wallet,
      `Your wallet address ${wallet.address} has been Approved by Velo admin`,
    );

    await getConnection('master').transaction(async (transaction) => {
      await transaction.save(notification);
      await transaction.save(wallet);
    });
  }

  async isWhitelistStellar(balances: Array<StellarBalance>): Promise<boolean> {
    for (const pair of this.listPair) {
      const baseCoin = {
        asset_code: pair.base_symbol,
        asset_issuer: pair.base_stellar_issuer,
        asset_type: pair.base_type,
      };
      const targetCoin = {
        asset_code: pair.quote_symbol,
        asset_issuer: pair.quote_stellar_issuer,
        asset_type: pair.quote_type,
      };
      const baseCoinInBalance = balances.find(
        (asset: StellarBalance) =>
          asset.asset_code == baseCoin.asset_code &&
          asset.asset_issuer == baseCoin.asset_issuer &&
          asset.asset_type == convertToStellarAsset(baseCoin.asset_type),
      );
      const targetCoinInBalance = balances.find(
        (asset: StellarBalance) =>
          asset.asset_code == targetCoin.asset_code &&
          asset.asset_issuer == targetCoin.asset_issuer &&
          asset.asset_type == convertToStellarAsset(targetCoin.asset_type),
      );
      if (!baseCoinInBalance || !targetCoinInBalance) {
        return false;
      }
      const whitelisted =
        baseCoinInBalance.is_authorized &&
        baseCoinInBalance.is_authorized_to_maintain_liabilities &&
        targetCoinInBalance.is_authorized &&
        targetCoinInBalance.is_authorized_to_maintain_liabilities;
      if (!whitelisted) {
        return false;
      }
    }
    return true;
  }
}
