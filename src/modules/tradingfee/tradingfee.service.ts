import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityType, HistoryLogEntity } from 'src/models/entities/history-log.entity';
import { NotificationEntity, NotificationType } from 'src/models/entities/notification.entity';
import { TradingFee } from 'src/models/entities/trading-fee.entity';
import { TradingFeeRepository } from 'src/models/repositories/trading-fee.repository';
import { CreateTradingFeeDto } from 'src/modules/tradingfee/dto/create-tradingfee.dto';
import { UpdateTradingFeeDto } from 'src/modules/tradingfee/dto/update-tradingfee.dto';
import { TRADING_FEE } from 'src/shares/constants/constant';
import { Network } from 'src/shares/enums/network';
import { SocketEmitter } from 'src/shares/helpers/socket-emitter';
import { DeleteResult, getConnection, Repository } from 'typeorm';

@Injectable()
export class TradingFeeService {
  constructor(
    @InjectRepository(TradingFeeRepository, 'master')
    private tradingFeeRepoMaster: Repository<TradingFee>,
    @InjectRepository(TradingFeeRepository, 'report')
    private tradingFeeRepoReport: Repository<TradingFee>,
  ) {}

  async findAll(): Promise<TradingFee[]> {
    return await this.tradingFeeRepoReport.find();
  }

  async findById(id: number): Promise<boolean> {
    const tradingFee = await this.tradingFeeRepoReport.findOne({ id: id });
    if (!tradingFee) {
      return false;
    }
    return true;
  }

  async create(tradingFee: CreateTradingFeeDto): Promise<TradingFee> {
    const foundTradingFee = await this.tradingFeeRepoReport.findOne({ name: tradingFee.name });
    if (foundTradingFee) {
      throw new HttpException({ key: 'tradingfee.EXISTS' }, HttpStatus.BAD_REQUEST);
    }
    return await this.tradingFeeRepoMaster.save(tradingFee);
  }

  async delete(id: number): Promise<DeleteResult> {
    const tradingFee = await this.findById(id);
    if (!tradingFee) {
      throw new HttpException({ key: 'tradingfee.NOT_FOUND' }, HttpStatus.NOT_FOUND);
    }
    return await this.tradingFeeRepoMaster.delete(id);
  }

  async update(id: number, tradingFee: UpdateTradingFeeDto): Promise<TradingFee> {
    const foundTradingFee = await this.tradingFeeRepoReport.findOne(id);
    if (!foundTradingFee) {
      throw new HttpException({ key: 'tradingfee.NOT_FOUND' }, HttpStatus.NOT_FOUND);
    }
    // Write to history log:
    const settingName = tradingFee.limit_order ? TRADING_FEE.LIMIT_ORDER : TRADING_FEE.MARKET_ORDER;

    let orderType = '';
    let oldValue = '';
    let newValue = '';

    if (tradingFee.market_order) {
      newValue = tradingFee.market_order;
      oldValue = foundTradingFee.market_order;
      foundTradingFee.market_order = tradingFee.market_order;
      orderType = 'market order';
    } else {
      newValue = tradingFee.limit_order;
      oldValue = foundTradingFee.limit_order;
      foundTradingFee.limit_order = tradingFee.limit_order;
      orderType = 'limit order';
    }

    let networkAlias = '';
    switch (Number(foundTradingFee.network)) {
      case Network.BSC:
        networkAlias = 'BSC';
        break;
      case Network.Stellar:
        networkAlias = 'Stellar';
        break;
      default:
        throw Error('Invalid network');
    }
    const historyEntity = new HistoryLogEntity();
    historyEntity.admin_id = tradingFee.userId;
    historyEntity.activities = `${tradingFee.email} has changed ${tradingFee.orderBookName} ${settingName}`;
    historyEntity.admin_id = tradingFee.userId;
    historyEntity.activity_type = ActivityType.ManageAdmin;

    const notification = NotificationEntity.createNotification(
      -1,
      NotificationType.OrderBookTradingFee,
      `Trading fee in ${networkAlias} order book for ${orderType} 
      has been changed from ${oldValue} to ${newValue}`,
      new Date(Date.now() + 86400000 * 7),
    );
    await getConnection('master').transaction(async (transaction) => {
      await transaction.save(historyEntity);
      await transaction.save(foundTradingFee);
      await transaction.save(notification);
    });

    SocketEmitter.getInstance().emitTradingFee();

    return foundTradingFee;
  }

  async getStellarTradingFee(): Promise<TradingFee> {
    return await this.tradingFeeRepoReport.findOne({ network: Network.Stellar });
  }

  async getBscTradingFee(): Promise<TradingFee> {
    return await this.tradingFeeRepoReport.findOne({ network: Network.BSC });
  }
}
