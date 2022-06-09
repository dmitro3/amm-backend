import { BigNumber } from '@0x/utils';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository, InjectConnection } from '@nestjs/typeorm';
import { getConfig } from 'src/configs/index';
import { IntervalSettings } from 'src/models/entities/interval-settings.entity';
import { User } from 'src/models/entities/users.entity';
import { ConfigIntervalRepository } from 'src/models/repositories/config-interval.respository';
import { FunctionalCurrencyRepository } from 'src/models/repositories/functional-currency.repository';
import { HistoryLogRepository } from 'src/models/repositories/history-log.repository';
import { IntervalSettingRepository } from 'src/models/repositories/interval-settings.repository';
import { TradeRepository } from 'src/models/repositories/trade.repository';
import { UserRepository } from 'src/models/repositories/user.repository';
import { WalletRepository } from 'src/models/repositories/wallet.respository';
import { CollectedFeeResDto } from 'src/modules/admin/dto/collected-fee-res.dto';
import { CollectedFeesDto } from 'src/modules/admin/dto/collected-fees.dto';
import { DownloadCollectedFeerequest } from 'src/modules/admin/dto/download-collected-fee-request.dto';
import { DownloadCollectedFeeResponse } from 'src/modules/admin/dto/download-collected-fee-response.dto';
import { DownloadCollectedFeeDto } from 'src/modules/admin/dto/download-collected-fee.dto';
import { TradeEntityResponse } from 'src/modules/admin/dto/trade-entity-res.dto';
import { AdminUserStatus } from 'src/modules/admin/enums';
import { MailService } from 'src/modules/mail/mail.service';
import { ExchangeRate } from 'src/modules/misc/dto/xe.dto';
import { MiscService } from 'src/modules/misc/misc.service';
import { WrapIntervalSettingsDto } from 'src/modules/users/dto/wrap-interval-settings.dto';
import {
  DownloadCollectedFeeColum,
  ONE_DAY,
  ONE_HOUR_IN_MINUTE as ONE_HOUR_IN_MINUTE,
  ONE_MONTH,
  ONE_YEAR,
  PERCENT_NUMBER_REGEX,
  TRADING_METHOD_FILTER,
} from 'src/shares/constants/constant';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { Connection, getConnection } from 'typeorm';
import { ActivityType, HistoryLogEntity } from 'src/models/entities/history-log.entity';
import { NotificationEntity, NotificationType } from 'src/models/entities/notification.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(UserRepository, 'master')
    public readonly usersRepositoryMaster: UserRepository,
    @InjectRepository(UserRepository, 'report')
    public readonly usersRepositoryReport: UserRepository,
    @InjectRepository(IntervalSettingRepository, 'master')
    public readonly intervalSettingsRepoMaster: IntervalSettingRepository,
    @InjectRepository(IntervalSettingRepository, 'report')
    public readonly intervalSettingRepoReport: IntervalSettingRepository,
    @InjectRepository(ConfigIntervalRepository, 'master')
    public readonly configIntervalRepoMaster: ConfigIntervalRepository,
    @InjectRepository(WalletRepository, 'master')
    public readonly walletRepoMaster: WalletRepository,
    @InjectRepository(WalletRepository, 'report')
    public readonly walletRepoReport: WalletRepository,
    @InjectRepository(TradeRepository, 'report')
    public readonly tradeRepoReport: TradeRepository,
    private readonly miscService: MiscService,
    @InjectRepository(FunctionalCurrencyRepository, 'report')
    public readonly functionCurrencyRepoReport: FunctionalCurrencyRepository,
    private mailService: MailService,
    @InjectRepository(HistoryLogRepository, 'master')
    public readonly historyLogRepoMaster: HistoryLogRepository,
    @InjectRepository(HistoryLogRepository, 'report')
    public readonly historyLogRepoReport: HistoryLogRepository,
    @InjectConnection('master')
    private connection: Connection,
  ) {}

  async saveIntervalSettings(intervalList: WrapIntervalSettingsDto): Promise<Response<Partial<IntervalSettings[]>>> {
    const intervalListToSave: IntervalSettings[] = [];
    const formatFalse = intervalList.intervals.filter(
      (item) => !new RegExp(PERCENT_NUMBER_REGEX).test(item.by_the_interval),
    );
    const formatIntervalFalse = intervalList.intervals.filter(
      (item) => Number(item.interval) % ONE_HOUR_IN_MINUTE !== 0 && ONE_HOUR_IN_MINUTE % Number(item.interval) !== 0,
    );
    if (formatFalse.length > 0 || formatIntervalFalse.length > 0) {
      throw new HttpException({ key: 'user.WRONG_INTERVAL_FORMAT' }, HttpStatus.BAD_REQUEST);
    }
    intervalList.intervals.forEach((item) => {
      const byTheInterval = new BigNumber(item.by_the_interval);
      const interval = this.convertInterval(Number(item.interval));
      if (interval !== undefined) {
        const intervalSetting = new IntervalSettings();
        intervalSetting.interval = Number(item.interval);
        intervalSetting.by_the_interval = item.by_the_interval;
        intervalSetting.annualized = byTheInterval.multipliedBy(Math.sqrt(interval)).toString();
        return intervalListToSave.push(intervalSetting);
      }
    });
    const historyLog = new HistoryLogEntity();
    historyLog.admin_id = intervalList.adminId;
    historyLog.activities = `${intervalList.adminEmail} has uploaded confidence interval`;
    historyLog.activity_type = ActivityType.ManageAdmin;

    const notification = NotificationEntity.createNotification(
      -1,
      NotificationType.Confidence,
      'The confidence interval table has been updated by Velo admin',
    );

    await getConnection('master').transaction(async (transaction) => {
      await transaction.save(historyLog);
      await transaction.save(notification);
      await this.intervalSettingsRepoMaster.save(intervalListToSave);
    });

    const intervalListResponse = await this.intervalSettingRepoReport.getAllInterval(
      intervalList.filter.page,
      intervalList.filter.limit,
    );
    return intervalListResponse;
  }

  private convertInterval(interval: number): number {
    if (interval / ONE_HOUR_IN_MINUTE <= 1) {
      return (ONE_HOUR_IN_MINUTE / interval) * 24 * 365;
    } else {
      // hour
      if (interval / ONE_DAY < 1) {
        return (interval / ONE_HOUR_IN_MINUTE) * 24 * 365;
      }
      // day
      if (interval / ONE_MONTH < 1) {
        return (interval / ONE_DAY) * 365;
      }
      // month
      if (interval / ONE_YEAR < 1) {
        return (interval / ONE_MONTH) * 12;
      } else {
        return interval / ONE_YEAR;
      }
    }
  }

  async disableAdmin(userId: number): Promise<User> {
    const user = await this.usersRepositoryMaster.findOne({ id: userId });
    if (!user) {
      throw new HttpException({ key: 'user.ADMIN_NOT_FOUND' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (user.locked === AdminUserStatus.Unlocked) {
      const mail_support = getConfig().get<string>('mail.from');
      this.mailService.sendMailDisableAccount(user.email, mail_support);
    }
    user.locked = AdminUserStatus.Locked;
    return this.usersRepositoryReport.save(user);
  }

  async enableAdmin(userId: number): Promise<User> {
    const user = await this.usersRepositoryMaster.findOne({ id: userId });
    if (!user) {
      throw new HttpException({ key: 'user.ADMIN_NOT_FOUND' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    if (user.locked === AdminUserStatus.Locked) {
      const clientUrl = getConfig().get<string>('fcx.admin');
      this.mailService.sendMailEnableAccount(user.email, `${clientUrl}/sign-in`);
    }
    user.locked = AdminUserStatus.Unlocked;
    return this.usersRepositoryReport.save(user);
  }

  async checkExistWalletAddress(address: string): Promise<boolean> {
    const existAddress = await this.walletRepoMaster.findOneWalletByAddress(address);
    if (existAddress) {
      return true;
    } else {
      return false;
    }
  }

  async getCollectedFees(params: CollectedFeesDto): Promise<CollectedFeeResDto[]> {
    const exchangeRates = await this.getExchangeRates();
    const trades = await this.tradeRepoReport.getTrades(params);
    const convertedTrades = trades.map((trade) => {
      return {
        value: this.getCollectedFee(trade, exchangeRates),
        timestamp: trade.created_at.getTime(),
      };
    });

    let timestamps = params.timestamps;
    if (!timestamps) {
      timestamps = [];
      const startTime = params.startTime || 0;
      const endTime = params.endTime || 0;
      for (let i = startTime; i <= endTime; i += params.interval) {
        timestamps.push(i);
      }
    }

    const bars = [];
    let tradeIndex = 0;
    for (let i = 0; i < timestamps.length - 1; i++) {
      const start = timestamps[i];
      const end = timestamps[i + 1];
      const { value, index } = this.getCollectedFeeInRange(start, end, convertedTrades, tradeIndex);
      bars.push({
        value,
        timestamp: timestamps[i],
      });
      tradeIndex = index;
    }
    return bars;
  }

  private async getExchangeRates(): Promise<{ [key: string]: string }> {
    const exchangeRates = await this.miscService.getExchangeRates();
    const currencies = await this.functionCurrencyRepoReport.find();
    const result = {};
    for (const currency of currencies) {
      result[currency.digital_credits] = this.getExchangeRate(currency.iso_code, exchangeRates);
    }
    result['USDT'] = 1;
    return result;
  }

  private getExchangeRate(isoCode: string, exchangeRates: ExchangeRate[]): number {
    for (const rate of exchangeRates) {
      if (rate.coin === isoCode) {
        return rate.rate;
      }
    }
    return 0;
  }

  private getCollectedFee(trade: TradeEntityResponse, exchangeRates: { [key: string]: string }): string {
    const sellFeeValue = new BigNumber(trade.sell_fee).times(exchangeRates[trade.base_name]);
    const buyFeeValue = new BigNumber(trade.buy_fee).times(exchangeRates[trade.quote_name]);
    return sellFeeValue.plus(buyFeeValue).toString();
  }

  private getCollectedFeeInRange(
    startTime: number,
    endTime: number,
    trades: { timestamp: number; value: string }[],
    startIndex: number,
  ): { value: string; index: number } {
    let totalFee = new BigNumber(0);
    let tradeIndex = startIndex;
    while (tradeIndex < trades.length) {
      const trade = trades[tradeIndex];
      if (trade.timestamp < startTime) {
        tradeIndex++;
      } else if (trade.timestamp < endTime) {
        totalFee = totalFee.plus(trade.value);
        tradeIndex++;
      } else {
        break;
      }
    }
    return {
      value: totalFee.toString(),
      index: tradeIndex,
    };
  }

  async downloadCollectedFee(params: DownloadCollectedFeerequest): Promise<DownloadCollectedFeeResponse> {
    const trades = await this.tradeRepoReport.downloadCollectedFee(params);
    const exchangeRates = await this.getExchangeRates();
    const response = [];
    trades.forEach((trade) => {
      const downloadCollectedDto = new DownloadCollectedFeeDto();
      downloadCollectedDto.pairName = `${trade.base_name}/${trade.quote_name}`;
      downloadCollectedDto.network = `${
        TRADING_METHOD_FILTER.filter((method) => method.value === trade.network)[0].label
      }`;
      downloadCollectedDto.date = new Date(trade.created_at).getTime();
      downloadCollectedDto.collectedFee = this.getCollectedFee(trade, exchangeRates);
      response.push(downloadCollectedDto);
    });
    return {
      collectedFees: response,
      colums: DownloadCollectedFeeColum,
    };
  }
}
