// eslint-disable-next-line @typescript-eslint/no-var-requires
const Web3 = require('web3');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios');
import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n/dist/services/i18n.service';
import { MessageResponse } from 'src/i18n/message';
import { UserWallet } from 'src/models/entities/user-wallet.entity';
import { WalletRepository } from 'src/models/repositories/wallet.respository';
import { UserOptionalDto } from 'src/modules/admin/dto/user-optional.dto';
import { UsersService } from 'src/modules/users/users.service';
import { WalletStatus } from 'src/modules/wallets/enums/wallet.enum';
import { Network } from 'src/shares/enums/network';
import { isStellarPublicKey } from 'src/shares/helpers/stellar-check-address';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { getConfig } from 'src/configs';
import { StellarBalance } from 'src/shares/interfaces/stellar-balance';
import { convertToStellarAsset } from 'src/shares/helpers/stellar';
import { CoinRepository } from 'src/models/repositories/coin.repository';

@Injectable()
export class WalletService {
  private web3;

  constructor(
    @InjectRepository(WalletRepository, 'master')
    public readonly walletRepoMaster: WalletRepository,
    @InjectRepository(WalletRepository, 'report')
    public readonly walletRepoReport: WalletRepository,
    @InjectRepository(CoinRepository, 'master')
    public readonly CoinRepoMaster: CoinRepository,
    @InjectRepository(CoinRepository, 'report')
    public readonly CoinRepoReport: CoinRepository,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private i18n: I18nService,
  ) {
    const rpcUrl = getConfig().get<string>('rpc_url');
    this.web3 = new Web3();
    this.web3.setProvider(new Web3.providers.HttpProvider(rpcUrl));
  }

  async postWallet(listUserWallet: UserWallet[]): Promise<UserWallet[]> {
    const dataSave = this.walletRepoMaster.create(listUserWallet);
    await this.walletRepoMaster.save(dataSave);

    return dataSave;
  }

  async findAllWallet(
    page: number,
    limit: number,
    { user_id, user_type, network, status, create_at_sort }: UserOptionalDto,
  ): Promise<Response<UserWallet[]>> {
    return this.walletRepoReport.findAllWallet(page, limit, user_id, user_type, network, status, null, create_at_sort);
  }

  findOneWallet(id: number): Promise<Partial<UserWallet>> {
    return this.walletRepoReport.findOneWallet(id);
  }

  updateUserWallet(id: number, address: string, userId: number): Promise<Partial<UserWallet>> {
    return this.walletRepoMaster.updateUserWallet(id, address, userId);
  }

  deleteWallet(id: number): Promise<Partial<UserWallet>> {
    return this.walletRepoMaster.deleteWallet(id);
  }

  // user create wallet
  async userCreateWallet(wallet: UserWallet): Promise<Partial<UserWallet> | unknown> {
    const rs = await this.walletRepoReport.findOneWalletByAddress(wallet.address);
    try {
      if (!rs) {
        const dataSave = this.walletRepoMaster.create(wallet);
        await this.walletRepoMaster.save(dataSave);
        return dataSave;
      } else {
        if (rs.user_id === wallet.user_id) {
          if (rs.status === WalletStatus.Pending && wallet.status === WalletStatus.Submit) {
            return { error_code: MessageResponse.WALLET_STATUS_ALREADY_PENDING, wallet: rs };
          }
          if (rs.status === WalletStatus.Submit && wallet.status === WalletStatus.Pending) {
            return this.updateUserWallet(rs.id, rs.address, rs.user_id);
          } else {
            return { error_code: MessageResponse.WALLET_EXISTS_BY_SELF, wallet };
          }
        } else return { error_code: MessageResponse.WALLET_EXISTS_BY_ANOTHER, wallet };
      }
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        const rsMaster = await this.walletRepoMaster.findOneWalletByAddress(wallet.address);
        if (rsMaster) {
          if (rsMaster.user_id === wallet.user_id) {
            return { error_code: MessageResponse.WALLET_EXISTS_BY_SELF, wallet };
          } else return { error_code: MessageResponse.WALLET_EXISTS_BY_ANOTHER, wallet };
        }
      }
    }
  }

  // Admin
  async approvedWhiteListAddress({ ids, status }: { ids: number[]; status: number }): Promise<Partial<UserWallet[]>> {
    return this.walletRepoMaster.approvedWhiteListAddress({ ids, status });
  }

  async getUserIdByWalletAccount(account: string): Promise<number | undefined> {
    const userWallet = await this.walletRepoReport.findOne({
      select: ['user_id'],
      where: {
        address: account,
      },
    });

    return userWallet?.user_id;
  }

  async getWalletByAddress(address: string): Promise<UserWallet> {
    return await this.walletRepoReport.getWalletByAddress(address);
  }

  async updateWallet(wallet: UserWallet): Promise<UserWallet> {
    return await this.walletRepoMaster.save(wallet);
  }

  async checkWalletExistByAddress(address: Array<string>): Promise<UserWallet[]> {
    return await this.walletRepoMaster.findAllWalletByAddress(address);
  }

  //VALIDATE WALLET ADDRESS
  async checkWalletAddressNetwork(address: string): Promise<number> {
    let networkWallet;

    // check network for Stellar
    const isStellarNetwork = isStellarPublicKey(address);
    if (isStellarNetwork) {
      networkWallet = Network.Stellar;
    }

    // check network wallet for Ethers or BSC not Stellar
    try {
      const isBSCNetwork = await this.web3.eth.getCode(address); // getCode return 0x => wallet or !== 0x => contract
      if (isBSCNetwork === '0x') {
        networkWallet = Network.BSC;
      }
    } catch (error) {}

    if (!networkWallet) {
      throw new HttpException({ key: 'user-wallet.INVALID_ADDRESS' }, HttpStatus.BAD_REQUEST);
    }

    return networkWallet;
  }

  async isWalletAddressExist(address: string): Promise<boolean> {
    const res = await this.walletRepoMaster.findOneWalletByAddress(address);
    return res ? true : false;
  }

  async checkWalletAddressTrustline(address: string): Promise<boolean> {
    const dbCoinAssetCode = await this.CoinRepoMaster.getAllCoins();

    const response = await axios.get(`${getConfig().get<string>('stellar_url')}/accounts/${address}`);
    const stellarAssetCode = response?.data.balances;

    for (const dbCoin of dbCoinAssetCode) {
      const dbCointCorrespondingStellarBalance = stellarAssetCode.find(
        (stellarBalance: StellarBalance) =>
          stellarBalance.asset_code === dbCoin.symbol &&
          stellarBalance.asset_issuer === dbCoin.stellar_issuer &&
          stellarBalance.asset_type === convertToStellarAsset(dbCoin.type),
      );

      if (!dbCointCorrespondingStellarBalance) return false;
    }

    return true;
  }

  async getListStellarAddressPending(): Promise<UserWallet[]> {
    return await this.walletRepoReport.getListStellarAddressPending();
  }
}
