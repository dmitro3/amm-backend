import { Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Erc20Contract } from 'src/shares/contracts/erc20.contract';
import { CoinMarketCapsClient } from 'src/shares/clients/coin-market-caps.client';
import { SentryHelper } from 'src/shares/helpers/sentry.helper';
import { InjectRepository } from '@nestjs/typeorm';
import { CoinRepository } from 'src/models/repositories/coin.repository';
import { BigNumber } from '@0x/utils';
import { PnlRepository } from 'src/models/repositories/pnl.repository';
import { getConfig } from 'src/configs';
import { UserRepository } from 'src/models/repositories/user.repository';
import { WalletRepository } from 'src/models/repositories/wallet.respository';
import { Network } from 'src/shares/enums/network';

// eslint-disable-next-line
const _ = require('lodash');
// eslint-disable-next-line
const moment = require('moment');

export class CalculateBalances {
  private readonly logger = new Logger(CalculateBalances.name);
  constructor(
    @InjectRepository(CoinRepository, 'report')
    public readonly coinRepoReport: CoinRepository,
    @InjectRepository(UserRepository, 'report')
    public readonly userRepoReport: UserRepository,
    @InjectRepository(WalletRepository, 'report')
    public readonly walletRepoReport: WalletRepository,
    @InjectRepository(CoinRepository, 'master')
    public readonly coinRepoMaster: CoinRepository,
    @InjectRepository(PnlRepository, 'master')
    public readonly pnlRepoMaster: PnlRepository,
  ) {}

  @Cron('0 0 0 * * *')
  @Cron('*/100 * * * * *')
  async handleCron(): Promise<boolean> {
    try {
      const base = getConfig().get<string>('base_pnl');
      const listUsers = await this.userRepoReport.getListUserActive();
      if (!listUsers.length) {
        return false;
      }
      const listUserIds = _.map(listUsers, 'id');
      const listWallet = await this.walletRepoReport.getWalletByUserId(listUserIds);
      const userWallets = {};
      listWallet.forEach((item) => {
        if (!userWallets[item.user_id]) {
          userWallets[item.user_id] = {};
        }
        if (!userWallets[item.user_id][item.network]) {
          userWallets[item.user_id][item.network] = [];
        }
        userWallets[item.user_id][item.network].push(item.address);
      });
      const listTokens = await this.coinRepoReport.getBaseInfo();
      if (!listTokens.length) {
        return false;
      }

      const addressToSymbol = {
        bsc_address: {},
        stellar_issuer: {},
      };
      listTokens.forEach((item) => {
        addressToSymbol['bsc_address'][item.bsc_address] = item.symbol;
        addressToSymbol['stellar_issuer'][item.stellar_issuer] = item.symbol;
      });
      const listNameToken = _.map(listTokens, 'symbol');
      const listPriceToken = await this.getPriceToken(listNameToken, base);

      const listAddressBSCToken = _.map(listTokens, 'bsc_address');
      const listAddressStellarToken = _.map(listTokens, 'stellar_issuer');

      const listSaves = [];
      for (let i = 0; i < listUserIds.length; i++) {
        const userId = listUserIds[i];
        const paramsAmount = {
          bsc: listAddressBSCToken,
          stellar: listAddressStellarToken,
          list_tokens: listTokens,
          address_to_symbol: addressToSymbol,
          bsc_addresses: userWallets[userId][Network.BSC] ?? [],
          stellar_address: userWallets[userId][Network.Stellar] ?? [],
        };

        const listAmountToken = await this.getAmountToken(paramsAmount);
        let totalBscAmount = new BigNumber(0);
        let totalStellarAmount = new BigNumber(0);

        listTokens.forEach((item) => {
          const bscAmount = listAmountToken[item.symbol]['bsc'] ?? 0;
          const stellarAmount = listAmountToken[item.symbol]['stellar'] ?? 0;
          const price = listPriceToken[item.symbol] ?? 0;
          totalBscAmount = totalBscAmount.plus(new BigNumber(bscAmount).times(new BigNumber(price)));
          totalStellarAmount = totalStellarAmount.plus(new BigNumber(stellarAmount).times(new BigNumber(price)));
        });
        listSaves.push({
          user_id: userId,
          total_amount: totalBscAmount.toString(),
          network_id: Network.BSC,
          date: moment().format('YYYYMMDD'),
        });

        listSaves.push({
          user_id: userId,
          total_amount: totalStellarAmount.toString(),
          network_id: Network.Stellar,
          date: moment().format('YYYYMMDD'),
        });
      }

      const listSaveChunks = _.chunk(listSaves, 100);
      const listSavePromise = [];
      for (let i = 0; i < listSaveChunks.length; i++) {
        listSavePromise.push(this.pnlRepoMaster.save(listSaveChunks[i]));
      }

      await Promise.all(listSavePromise);
    } catch (e) {
      this.handleError(e);
    }
    return true;
  }

  async getAmountToken(paramsAmount): Promise<{ [key: string]: string }> {
    const bscTokenAmount = await this.getAmountNetworkToken(paramsAmount.bsc, paramsAmount.bsc_addresses);
    const stellarTokenAmount = await this.getAmountNetworkToken(paramsAmount.stellar, paramsAmount.stellar_address);
    const amoutTotal = {};
    paramsAmount.list_tokens.forEach((item) => {
      amoutTotal[item.symbol] = {
        bsc: bscTokenAmount[item.bsc_address] ?? '0',
        stellar: stellarTokenAmount[item.stellar_issuer] ?? '0',
        total:
          new BigNumber(bscTokenAmount[item.bsc_address])
            .plus(new BigNumber(stellarTokenAmount[item.stellar_issuer]))
            .toString() ?? '0',
      };
    });
    return amoutTotal;
  }

  async getAmountNetworkToken(listAddressToken: string[], ownerAddress: string[]): Promise<{ [key: string]: string }> {
    const promises = [];
    listAddressToken.forEach((item) => {
      const itemContract = new Erc20Contract(item);
      ownerAddress.forEach((address) => {
        promises.push(itemContract.getBalanceWithoutDecimal(address));
      });
    });
    const result = await Promise.all(promises);
    const amounts = {};
    for (let i = 0; i < listAddressToken.length; i++) {
      amounts[listAddressToken[i]] = result[i];
    }
    return amounts;
  }

  async getPriceToken(listNameToken: string[], base: string): Promise<{ [key: string]: string }> {
    const dataRaw = await CoinMarketCapsClient.getInstance().getPrice(listNameToken, base);
    const data = CoinMarketCapsClient.getInstance().handleResponse(dataRaw);
    const result = {};
    for (const token in data) {
      result[token] = data[token]['quote'][base].price;
    }
    return result;
  }

  async handleError(exception: Error): Promise<void> {
    //todo: implement send mail for admin

    //todo: throw to sentry
    SentryHelper.captureException(exception);
  }
}
