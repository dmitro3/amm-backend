import { UserTypeStatus } from 'src/modules/users/enums/user-status.enum';
import {
  Body,
  CACHE_MANAGER,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { I18nService } from 'nestjs-i18n';
import { UserWallet } from 'src/models/entities/user-wallet.entity';
import { WalletService } from 'src/modules/wallets/wallet.service';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { ChangeUserWalletStatusDto } from 'src/modules/admin/dto/user-wallet-status.dto';
import { UserOptionalDto } from 'src/modules/admin/dto/user-optional.dto';
import { WALLET_STATUS } from 'src/modules/wallets/enums/wallet.enum';
import { RolesGuardAdmin } from 'src/shares/decorators/role-admin.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuardAdmin)
@Controller('/admin/user-wallet')
@ApiTags('admin')
export class UserWalletAdminController {
  constructor(
    private userWalletService: WalletService,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private i18n: I18nService,
  ) {}

  @Get('/list')
  async findAll(
    @Query() { page, limit }: PaginationInput,
    @Query() optional: UserOptionalDto,
  ): Promise<Response<UserWallet[]>> {
    optional.role = UserTypeStatus.Normal;
    return await this.userWalletService.findAllWallet(page, limit, optional);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Id of wallet',
  })
  async findOne(@Param('id') id: number): Promise<Partial<UserWallet>> {
    const rs = await this.userWalletService.findOneWallet(id);
    return rs;
  }

  @Put('/change-status')
  @ApiOperation({
    description: 'Update status wallet',
  })
  @ApiBody({
    type: ChangeUserWalletStatusDto,
    description: 'ids: id or list ids tables, status: choose number 1 - approved, 2 - pending, 3 - submit, 4 - blocked',
  })
  async changeUserStatus(@Body() body: { ids: number[]; status: number }): Promise<Partial<UserWallet[]>> {
    if (!WALLET_STATUS.includes(Number(body.status))) {
      throw new HttpException('status does not exists', HttpStatus.BAD_REQUEST);
    }
    return this.userWalletService.approvedWhiteListAddress(body);
  }
}
