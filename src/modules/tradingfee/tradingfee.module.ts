import { HistoryLogRepository } from 'src/models/repositories/history-log.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
//import { TradingFee } from 'src/models/entities/trading-fee.entity';
import { TradingFeeController } from './tradingfee.controller';
import { TradingFeeService } from './tradingfee.service';
import { TradingFeeRepository } from 'src/models/repositories/trading-fee.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([TradingFeeRepository, HistoryLogRepository], 'master'),
    TypeOrmModule.forFeature([TradingFeeRepository, HistoryLogRepository], 'report'),
  ],
  controllers: [TradingFeeController],
  providers: [TradingFeeService],
  exports: [TradingFeeService, TypeOrmModule],
})
export class TradingFeeModule {}
