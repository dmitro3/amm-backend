import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryLogController } from 'src/modules/history-log/history-log.controller';
import { HistoryLogService } from 'src/modules/history-log/history-log.service';
import { HistoryLogRepository } from 'src/models/repositories/history-log.repository';
import { UserRepository } from 'src/models/repositories/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([HistoryLogRepository], 'master'),
    TypeOrmModule.forFeature([HistoryLogRepository, UserRepository], 'report'),
    Logger,
  ],
  providers: [Logger, HistoryLogService],
  controllers: [HistoryLogController],
  exports: [],
})
export class HistoryLogModule {}
