import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthService } from 'src/modules/healths/health.service';

@ApiTags('health')
@Controller('ping')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Get()
  getHealth(): Promise<string> {
    return this.healthService.getHealth();
  }
}
