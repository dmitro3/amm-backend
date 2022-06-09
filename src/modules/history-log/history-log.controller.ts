import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { HistoryLogService } from 'src/modules/history-log/history-log.service';
import { SearchHistoryLogDto } from 'src/modules/history-log/dto/search-history-log.dto';
import { HistoryLogEntity } from 'src/models/entities/history-log.entity';
import { RolesGuardAdmin } from 'src/shares/decorators/role-admin.decorator';
import { UserID } from 'src/shares/decorators/get-user-id.decorator';
import { Response } from 'src/shares/interceptors/response.interceptor';

@Controller('history-log')
@UseGuards(JwtAuthGuard, RolesGuardAdmin)
@ApiTags('HistoryLog')
@ApiBearerAuth()
export class HistoryLogController {
  constructor(private readonly historyLogService: HistoryLogService) {}

  @Get()
  async get(@Query() searchLog: SearchHistoryLogDto): Promise<Response<HistoryLogEntity[]>> {
    return await this.historyLogService.getListLog(searchLog);
  }

  @Post('log-whitelist/:status')
  async logChangeWhiteList(
    @UserID() userId: number,
    wallets: string[],
    @Param() param: { status: number },
  ): Promise<boolean> {
    this.historyLogService.logChangeWhiteList(userId, wallets, param.status);
    return true;
  }
}
