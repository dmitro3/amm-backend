// eslint-disable-next-line @typescript-eslint/no-var-requires
const moment = require('moment');
// eslint-disable-next-line
const Web3 = require('web3');
import { EntityManager, getConnection } from 'typeorm';
import { Server } from 'stellar-sdk';
import { BigNumber } from '@0x/utils';
import { Injectable, Logger } from '@nestjs/common';
import { Command, Console } from 'nestjs-console';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/models/entities/users.entity';
import { UserRepository } from 'src/models/repositories/user.repository';
import { WalletRepository } from 'src/models/repositories/wallet.respository';
import { CoinRepository } from 'src/models/repositories/coin.repository';
import { erc20Abi } from 'src/modules/contracts/abi/erc20Abi';
import { getConfig } from 'src/configs';
import { MiscService } from 'src/modules/misc/misc.service';
import { FunctionalCurrencyRepository } from 'src/models/repositories/functional-currency.repository';
import { Network } from 'src/shares/enums/network';
import { PnlRepository } from 'src/models/repositories/pnl.repository';
import { PnlEntity } from 'src/models/entities/pnl.entity';
import { LatestBlockService } from 'src/modules/latest-block/latest-block.service';
import { sleep } from 'src/shares/helpers/utils';
import { LatestBlockCoin, LatestBlockType } from 'src/modules/latest-block/latest-block.const';
import { TradeRepository } from 'src/models/repositories/trade.repository';
import { TradeEntity } from 'src/models/entities/trade.entity';
import { OrderRepository } from 'src/models/repositories/order.repository';
import { PairService } from 'src/modules/pairs/pair.service';
import { LatestBlockEntity, LatestBlockStatus } from 'src/models/entities/latest-block.entity';
import { OrderSide } from 'src/modules/orders/orders.const';
import { PnlsPrimaryKeyDto, UpdateTradeAmountDto } from 'src/modules/users/dto/pnls-primary-key.dto';
import { querySubGraph } from 'src/shares/helpers/subgraph';
import { PoolPnlRepository } from 'src/models/repositories/pool_pnl.repository';
import { PoolPnlEntity } from 'src/models/entities/pool_pnl.entity';

@Console()
@Injectable()
export class UsersConsole {
  private web3;
  private stellarServer;
  private coinsSymbol = [];
  private exchangeRates = [];
  private functionalCurrencies = [];
  private pnlPrimaryKeyDto = {
    date: null,
    user_id: null,
    wallet: null,
    symbol: null,
  };
  private yesterdayDate;

  private poolPnlPrimaryKeyDto = {
    date: null,
    user_id: null,
    wallet: null,
    symbol: null,
    pool_id: null,
  };

  constructor(
    private readonly logger: Logger,
    @InjectRepository(PnlRepository, 'master')
    private pnlRepoMaster: PnlRepository,
    @InjectRepository(PnlRepository, 'report')
    private pnlRepoReport: PnlRepository,

    @InjectRepository(PoolPnlRepository, 'master')
    private poolPnlRepoMaster: PoolPnlRepository,
    @InjectRepository(PoolPnlRepository, 'report')
    private poolPnlRepoReport: PoolPnlRepository,

    @InjectRepository(User, 'master')
    private usersRepoMaster: UserRepository,
    @InjectRepository(User, 'report')
    private usersRepoReport: UserRepository,

    @InjectRepository(WalletRepository, 'master')
    private walletRepoMaster: WalletRepository,
    @InjectRepository(WalletRepository, 'report')
    private walletRepoReport: WalletRepository,

    @InjectRepository(CoinRepository, 'report')
    private coinRepoReport: CoinRepository,
    @InjectRepository(FunctionalCurrencyRepository, 'report')
    private functionalCurrencyRepoReport: FunctionalCurrencyRepository,
    @InjectRepository(TradeRepository, 'report')
    private tradeRepoReport: TradeRepository,
    @InjectRepository(OrderRepository, 'report')
    private orderRepoReport: OrderRepository,

    private readonly miscService: MiscService,
    private readonly latestBlockService: LatestBlockService,
    private readonly pairService: PairService,
  ) {
    const rpcUrl = getConfig().get<string>('rpc_url');
    this.logger.setContext(UsersConsole.name);
    this.web3 = new Web3();
    this.web3.setProvider(new Web3.providers.HttpProvider(rpcUrl));
    const stellarUrl = getConfig().get<string>('stellar_url');
    this.stellarServer = new Server(stellarUrl);
  }

  // todo: Call bsc network to get amount by coin token and wallet address
  async getBscCoinAmount(coinToken: string, address: string): Promise<string> {
    const contract = new this.web3.eth.Contract(erc20Abi, coinToken);
    return await contract.methods.balanceOf(address).call();
  }

  // todo: Get balance of stellar account address
  async updateStellarUserBalance(): Promise<void> {
    const account = await this.stellarServer.loadAccount(this.pnlPrimaryKeyDto.wallet);
    const balances = account.balances;
    if (balances) {
      for (const index in balances) {
        const stellarCoinSymbol = balances[index].asset_code ? balances[index].asset_code : '';
        if (!this.isFcxCoin(stellarCoinSymbol)) continue;
        const rate = await this.getRateByCoinSymbol(stellarCoinSymbol);
        const ytdBalance = await this.getYesterdayPnlBalance();
        await this.saveOrUpdateUserBalance(balances[index].balance, rate, ytdBalance);
      }
    }
  }

  async getYesterdayPnlBalance(): Promise<string> {
    const ytdPnlPrimaryKey = {
      date: this.yesterdayDate,
      user_id: this.pnlPrimaryKeyDto.user_id,
      wallet: this.pnlPrimaryKeyDto.wallet,
      symbol: this.pnlPrimaryKeyDto.symbol,
    };
    const ytdPnl = await this.pnlRepoReport.getOneByPrimaryKey(ytdPnlPrimaryKey);
    if (ytdPnl) return ytdPnl.balance;
    return '0';
  }

  isFcxCoin(stellarCoinSymbol: string): boolean {
    for (const coinToken in this.coinsSymbol) {
      this.pnlPrimaryKeyDto.symbol = this.coinsSymbol[coinToken].symbol;
      if (this.pnlPrimaryKeyDto.symbol === stellarCoinSymbol) return true;
    }
    return false;
  }

  // todo: Convert amount to balance by coin symbol
  async convertCoinAmountToBalance(coinsSymbol: string, amount: string): Promise<BigNumber> {
    if (!this.functionalCurrencies[coinsSymbol]) throw Error(`No iso coin found for ${coinsSymbol}`);
    const isoCoin = this.functionalCurrencies[coinsSymbol];

    if (!this.exchangeRates[isoCoin]) throw Error(`No exchange rate found for ${isoCoin}`);
    const rate = this.exchangeRates[isoCoin];

    return new BigNumber(amount).times(rate);
  }

  async getRateByCoinSymbol(coinSymbol: string): Promise<string> {
    if (coinSymbol === 'USDT') return '1';
    if (!this.functionalCurrencies[coinSymbol]) throw Error(`No iso coin found for ${coinSymbol}`);
    const isoCoin = this.functionalCurrencies[coinSymbol];

    if (!this.exchangeRates[isoCoin]) throw Error(`No exchange rate found for ${isoCoin}`);
    return new BigNumber(1).div(this.exchangeRates[isoCoin]).toString();
  }

  // todo: get bsc balance by wallet address
  async updateBscUserBalance(): Promise<void> {
    for (const coinToken in this.coinsSymbol) {
      this.pnlPrimaryKeyDto.symbol = this.coinsSymbol[coinToken].symbol;
      let balance = await this.getBscCoinAmount(coinToken, this.pnlPrimaryKeyDto.wallet);
      balance = new BigNumber(balance).div(new BigNumber(10).pow(this.coinsSymbol[coinToken].decimal)).toString();
      const rate = await this.getRateByCoinSymbol(this.pnlPrimaryKeyDto.symbol);
      const ytdBalance = await this.getYesterdayPnlBalance();
      await this.saveOrUpdateUserBalance(balance, rate, ytdBalance);
    }
  }

  async saveOrUpdateUserBalance(balance: string, rate: string, ytdBalance: string): Promise<void> {
    const userBalance = await this.pnlRepoMaster.getOneByPrimaryKey(this.pnlPrimaryKeyDto);
    const transferAmount = new BigNumber(balance)
      .minus(ytdBalance)
      .minus(userBalance ? userBalance.transfer_amount : 0)
      .toString();

    if (!userBalance) {
      const newUserBalance = new PnlEntity();
      newUserBalance.date = this.pnlPrimaryKeyDto.date;
      newUserBalance.user_id = this.pnlPrimaryKeyDto.user_id;
      newUserBalance.wallet = this.pnlPrimaryKeyDto.wallet;
      newUserBalance.symbol = this.pnlPrimaryKeyDto.symbol;
      newUserBalance.balance = balance;
      newUserBalance.rate = rate;
      newUserBalance.transfer_amount = transferAmount;
      await this.pnlRepoMaster.save(newUserBalance);
    } else {
      await this.pnlRepoMaster.update(this.pnlPrimaryKeyDto, {
        updated_at: new Date(),
        balance: balance,
        rate: rate,
        transfer_amount: transferAmount,
      });
    }
  }

  async updateEachUserBalance(wallets: string[]): Promise<void> {
    for (const wallet in wallets) {
      this.pnlPrimaryKeyDto.wallet = wallet;
      const network = Number(wallets[wallet]);
      switch (network) {
        case Network.BSC:
          await this.updateBscUserBalance();
          break;
        case Network.Stellar:
          await this.updateStellarUserBalance();
          break;
        default:
          throw Error('Invalid network for update user balance');
      }
    }
  }

  async updateTradeAmountForUser(updateTradeAmount: UpdateTradeAmountDto, transaction: EntityManager): Promise<void> {
    const tradeDate = new Date(updateTradeAmount.createdTrade);
    const nextDate = new Date(tradeDate.getTime() + 24 * 60 * 60 * 1000);
    const nextDateConvert = new moment(nextDate).format('YYYY-MM-DD');
    const order = await this.orderRepoReport.findOne(updateTradeAmount.orderId);

    const pnlPrimaryKeyDto = {
      date: nextDateConvert,
      user_id: updateTradeAmount.userId,
      wallet: order.maker,
      symbol: updateTradeAmount.incomeSymbol,
    };

    let pnlsForIncomeAmount = await this.pnlRepoReport.getPnlByPrimaryFromTransaction(pnlPrimaryKeyDto, transaction);
    if (!pnlsForIncomeAmount) pnlsForIncomeAmount = await this.createPnlsEntityFromPrivateKey(pnlPrimaryKeyDto);

    pnlPrimaryKeyDto.symbol = updateTradeAmount.outcomeSymbol;
    let pnlsForOutcomeAmount = await this.pnlRepoReport.getPnlByPrimaryFromTransaction(pnlPrimaryKeyDto, transaction);
    if (!pnlsForOutcomeAmount) pnlsForOutcomeAmount = await this.createPnlsEntityFromPrivateKey(pnlPrimaryKeyDto);

    let incomeTradeAmount: BigNumber;
    let outcomeTradeAmount: BigNumber;
    if (updateTradeAmount.orderSide === OrderSide.Buy) {
      incomeTradeAmount = new BigNumber(updateTradeAmount.fillAmount);
      outcomeTradeAmount = new BigNumber(updateTradeAmount.fillAmount).times(updateTradeAmount.price);
    } else {
      incomeTradeAmount = new BigNumber(updateTradeAmount.fillAmount).times(updateTradeAmount.price);
      outcomeTradeAmount = new BigNumber(updateTradeAmount.fillAmount);
    }

    pnlsForIncomeAmount.trade_amount = incomeTradeAmount.toString();
    pnlsForIncomeAmount.updated_at = new Date();
    pnlsForOutcomeAmount.trade_amount = `-${outcomeTradeAmount.toString()}`;
    pnlsForOutcomeAmount.updated_at = new Date();
    await transaction.save(pnlsForIncomeAmount);
    await transaction.save(pnlsForOutcomeAmount);
  }

  async createPnlsEntityFromPrivateKey(pnlsPrivateKey: PnlsPrimaryKeyDto): Promise<PnlEntity> {
    const pnls = new PnlEntity();
    pnls.date = pnlsPrivateKey.date;
    pnls.user_id = pnlsPrivateKey.user_id;
    pnls.wallet = pnlsPrivateKey.wallet;
    pnls.symbol = pnlsPrivateKey.symbol;
    pnls.balance = '0';
    pnls.rate = '0';
    return pnls;
  }

  async updateTradeAmount(transaction: EntityManager, trade: TradeEntity): Promise<void> {
    const pairCoin = await this.pairService.getCoinByPairId(trade.pair_id);
    // for buy
    const updateTradeAmountPnls = {
      incomeSymbol: pairCoin.base.symbol,
      outcomeSymbol: pairCoin.quote.symbol,
      fillAmount: trade.filled_amount,
      price: trade.price,
      orderId: trade.buy_order_id,
      createdTrade: trade.created_at,
      userId: trade.buy_user_id,
      orderSide: OrderSide.Buy,
    };
    if (trade.buy_order_id !== -1) await this.updateTradeAmountForUser(updateTradeAmountPnls, transaction);

    // for sell
    updateTradeAmountPnls.userId = trade.sell_user_id;
    updateTradeAmountPnls.incomeSymbol = pairCoin.quote.symbol;
    updateTradeAmountPnls.outcomeSymbol = pairCoin.base.symbol;
    updateTradeAmountPnls.orderId = trade.sell_order_id;
    updateTradeAmountPnls.orderSide = OrderSide.Sell;
    if (trade.sell_order_id !== -1) await this.updateTradeAmountForUser(updateTradeAmountPnls, transaction);
  }

  @Command({
    command: 'delete-user-not-verify',
    description: 'Delete user not verify after 24h',
  })
  async deleteUserNotVerify(): Promise<void> {
    const listUserIdNoVerify24h = await this.usersRepoReport.listUserNotVerifyAfter24Hours();
    const deleteIds = listUserIdNoVerify24h.map((user) => user.id);
    await this.usersRepoMaster.delete(deleteIds);
  }

  @Command({
    command: 'update-users-balance',
    description: 'Update users balance',
  })
  async updateUsersBalance(): Promise<void> {
    this.pnlPrimaryKeyDto.date = new moment(new Date()).format('YYYY-MM-DD');
    this.yesterdayDate = new moment(this.pnlPrimaryKeyDto.date).subtract(1, 'day').format('YYYY-MM-DD');
    const exchangeRates = await this.miscService.getExchangeRates();
    exchangeRates.forEach((exchangeRate) => {
      this.exchangeRates[exchangeRate.coin] = exchangeRate.rate;
    });

    const currencies = await this.functionalCurrencyRepoReport.find();
    currencies.forEach((currency) => {
      this.functionalCurrencies[currency.digital_credits] = currency.iso_code;
    });

    const allCoins = await this.coinRepoReport.getAllCoins();
    allCoins.forEach((coin) => {
      this.coinsSymbol[coin.bsc_address] = {
        symbol: coin.symbol,
        decimal: coin.decimal,
      };
    });

    const userWallets = await this.walletRepoReport.getAllWalletApprove();
    const groupUserWallet = [];
    userWallets.forEach((userWallet) => {
      if (!groupUserWallet[userWallet.user_id]) groupUserWallet[userWallet.user_id] = [];
      groupUserWallet[userWallet.user_id][userWallet.address] = userWallet.network;
    });

    for (const userId in groupUserWallet) {
      this.pnlPrimaryKeyDto.user_id = Number(userId);
      await this.updateEachUserBalance(groupUserWallet[userId]);
    }
  }

  @Command({
    command: 'update-trades-amount',
    description: 'Update trade amount',
  })
  async updateTradesAmount(): Promise<void> {
    const latestBlock = await this.latestBlockService.getLatestBlock(LatestBlockCoin.bsc, LatestBlockType.Pnls);
    let cursor = latestBlock?.block || '0';
    while (true) {
      const trades = await this.tradeRepoReport.getTradesFromId(cursor);
      if (trades.length === 0) {
        this.logger.log('No trade found. Waiting for next');
        await sleep(3000);
        continue;
      }
      for (const trade of trades) {
        await getConnection('master').transaction(async (transaction) => {
          await this.updateTradeAmount(transaction, trade);
          cursor = trade.id.toString();

          const newLatestBlock = new LatestBlockEntity();
          newLatestBlock.block = cursor;
          newLatestBlock.network = LatestBlockCoin.bsc;
          newLatestBlock.type = LatestBlockType.Pnls;
          await transaction.save(newLatestBlock);
        });
      }
      await sleep(3000);
    }
  }

  async getPoolSharesByWalletAddress(address: string): Promise<Response> {
    const query = {
      query: `{poolShares (
      where: {
        userAddress: "${address}",
      }) {
      userAddress {
        id
      }
      balance
      poolId {
        id
        crp
        controller
        crpController
        totalShares
        liquidity
        symbol
        tokens {
          address
          symbol
          balance
        }
      }
    }}`,
    };
    return await querySubGraph(query);
  }

  async updateUserPoolPnl(wallet: string): Promise<void> {
    const response = await this.getPoolSharesByWalletAddress(wallet);
    const poolShares = (await response.json()).data.poolShares;
    if (!poolShares.length) return;

    for (const poolShare of poolShares) {
      const poolId = poolShare.poolId.crp === true ? poolShare.poolId.controller : poolShare.poolId.id;
      this.poolPnlPrimaryKeyDto.pool_id = poolId;
      for (const balanceByToken of poolShare.poolId.tokens) {
        const balance = new BigNumber(balanceByToken.balance).toString();
        const price = new BigNumber(poolShare.poolId.liquidity).div(poolShare.poolId.totalShares).toString();
        this.poolPnlPrimaryKeyDto.symbol = balanceByToken.symbol;

        const previousPoolPnlPk = {
          date: this.yesterdayDate,
          user_id: this.poolPnlPrimaryKeyDto.user_id,
          wallet: wallet,
          symbol: balanceByToken.symbol,
          pool_id: poolId,
        };

        const ytdPoolPnl = await this.poolPnlRepoMaster.getOneByPrimaryKey(previousPoolPnlPk);
        const poolPnl = await this.poolPnlRepoMaster.getOneByPrimaryKey(this.poolPnlPrimaryKeyDto);
        const transferAmount = ytdPoolPnl ? new BigNumber(balance).minus(ytdPoolPnl.balance).toString() : '0';

        if (!poolPnl) {
          const newPoolPnl = PoolPnlEntity.createPnl(this.poolPnlPrimaryKeyDto, balance, transferAmount, price);
          await this.poolPnlRepoMaster.save(newPoolPnl);
          continue;
        }
        await this.poolPnlRepoMaster.update(this.poolPnlPrimaryKeyDto, {
          balance: balance,
          transfer_amount: transferAmount,
          updated_at: new Date(),
        });
      }
    }
  }

  @Command({
    command: 'update-pools-pnl',
    description: 'Update Pool pnl',
  })
  async updateUsersPoolPnl(): Promise<void> {
    this.poolPnlPrimaryKeyDto.date = new moment(new Date()).format('YYYY-MM-DD');
    this.yesterdayDate = new moment(this.poolPnlPrimaryKeyDto.date).subtract(1, 'day').format('YYYY-MM-DD');
    const keyLatestBlock = `${LatestBlockType.PoolPnls}_${this.poolPnlPrimaryKeyDto.date}`;

    while (true) {
      const latestBlock = await this.latestBlockService.getLatestBlock(LatestBlockCoin.bsc, keyLatestBlock);

      if (latestBlock.status === LatestBlockStatus.Done) {
        this.logger.log('Process has done before');
        break;
      }

      const userWallets = await this.walletRepoReport.getListWalletApprove(latestBlock?.block || '0');

      if (userWallets.length === 0) {
        latestBlock.status = LatestBlockStatus.Done;
        await this.latestBlockService.updateLatestBlockStatus(latestBlock);
        this.logger.log('Done process');
        break;
      }

      for (const userWallet of userWallets) {
        this.poolPnlPrimaryKeyDto.user_id = userWallet.user_id;
        this.poolPnlPrimaryKeyDto.wallet = userWallet.address;
        await getConnection('master').transaction(async (transaction) => {
          await this.updateUserPoolPnl(userWallet.address);
          latestBlock.block = `${userWallet.id}`;
          await transaction.save(latestBlock);
        });
      }
    }
  }
}
