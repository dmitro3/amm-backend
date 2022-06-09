import { InjectRepository } from '@nestjs/typeorm';
import { HistoryLogRepository } from 'src/models/repositories/history-log.repository';
import { ActivityType, HistoryLogEntity } from 'src/models/entities/history-log.entity';
import { SearchHistoryLogDto } from 'src/modules/history-log/dto/search-history-log.dto';
import { UserRepository } from 'src/models/repositories/user.repository';
import { WalletStatus } from 'src/modules/wallets/enums/wallet.enum';
import { Response } from 'src/shares/interceptors/response.interceptor';

export class HistoryLogService {
  constructor(
    @InjectRepository(HistoryLogRepository, 'master')
    public readonly historyLogMaster: HistoryLogRepository,
    @InjectRepository(HistoryLogRepository, 'report')
    public readonly historyLogReport: HistoryLogRepository,
    @InjectRepository(UserRepository, 'report')
    public readonly userReport: UserRepository,
  ) {}

  async updateInsertLog(historyLog: HistoryLogEntity): Promise<HistoryLogEntity> {
    return await this.historyLogMaster.save(historyLog);
  }

  async getListLog(searchCondition: SearchHistoryLogDto): Promise<Response<HistoryLogEntity[]>> {
    return await this.historyLogReport.searchByCondition(searchCondition);
  }

  async logChangeWhiteList(adminId: number, wallets: string[], walletStatus: number): Promise<void> {
    const historyEntities = [];
    const userAdmin = await this.userReport.findOne(adminId);
    const status = walletStatus === WalletStatus.Approved ? 'whitelisted' : 'rejected';
    wallets.forEach((wallet) => {
      const newLog = new HistoryLogEntity();
      newLog.admin_id = adminId;
      newLog.wallet = wallet;
      newLog.activities = `${userAdmin.email} has ${status} ${wallet}`;
      newLog.activity_type = ActivityType.ManageUser;
      historyEntities.push(newLog);
    });
    await this.historyLogReport.save(historyEntities);
  }

  async logChangeUserStatus(adminId: number, userId: number, oldStatus: string, newStatus: string): Promise<void> {
    const userAdmin = await this.userReport.findOne(adminId);
    const newLog = new HistoryLogEntity();
    newLog.admin_id = userAdmin.id;
    newLog.activities = `${userAdmin.email} has change user status of ${userId} from ${oldStatus} to ${newStatus}`;
    newLog.activity_type = ActivityType.ManageUser;
    await this.updateInsertLog(newLog);
  }

  async logApprovedUser(adminId: number, userId: number, status: string): Promise<void> {
    const userAdmin = await this.userReport.findOne(adminId);
    const newLog = new HistoryLogEntity();
    newLog.admin_id = userAdmin.id;
    newLog.activities = `${userAdmin.email} has ${status} users ${userId}`;
    newLog.activity_type = ActivityType.ManageUser;
    await this.updateInsertLog(newLog);
  }

  async logCreatedAdmin(adminId: number, newAdminId: number): Promise<void> {
    const userAdmin = await this.userReport.findOne(adminId);
    const newLog = new HistoryLogEntity();
    newLog.admin_id = userAdmin.id;
    newLog.activity_type = ActivityType.ManageAdmin;
    newLog.activities = `${userAdmin.email} has created ${newAdminId}`;
    await this.updateInsertLog(newLog);
  }
}
