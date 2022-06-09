import { Module } from '@nestjs/common';
import { MatchOrdersService } from 'src/modules/contracts/match-order-features/match-orders.service';

@Module({
  providers: [MatchOrdersService],
  controllers: [],
})
export class ContractsModule {}
