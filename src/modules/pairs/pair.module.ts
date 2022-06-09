import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { PairService } from 'src/modules/pairs/pair.service';
import { PairController } from 'src/modules/pairs/pair.controller';
import { PairRepository } from 'src/models/repositories/pair.repository';
import { CoinRepository } from 'src/models/repositories/coin.repository';

@Module({
  providers: [PairService],
  controllers: [PairController],
  imports: [
    BullModule.registerQueue({
      name: 'pair',
    }),
    TypeOrmModule.forFeature([PairRepository, CoinRepository], 'master'),
    TypeOrmModule.forFeature([PairRepository, CoinRepository], 'report'),
  ],
  exports: [PairService],
})
export class PairModule {}
