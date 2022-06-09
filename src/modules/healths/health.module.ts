import { Module } from '@nestjs/common';
import { HealthController } from 'src/modules/healths/health.controller';
import { HealthService } from 'src/modules/healths/health.service';

@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
