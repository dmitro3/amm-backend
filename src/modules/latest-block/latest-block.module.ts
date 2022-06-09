import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LatestBlockRepository } from 'src/models/repositories/latest-block.repository';
import { LatestBlockService } from 'src/modules/latest-block/latest-block.service';

@Module({
  imports: [TypeOrmModule.forFeature([LatestBlockRepository], 'master')],
  providers: [LatestBlockService],
  exports: [LatestBlockService],
})
export class LatestBlockModule {}
