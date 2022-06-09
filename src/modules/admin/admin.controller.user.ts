import {
  Body,
  CACHE_MANAGER,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { I18nService } from 'nestjs-i18n';
import { PnlEntity } from 'src/models/entities/pnl.entity';
import { User } from 'src/models/entities/users.entity';
import { CreateAdminDto } from 'src/modules/admin/dto/create-admin.dto';
import { SearchUserByAdminDto } from 'src/modules/admin/dto/query.admin.user';
import { ChangeUserStatusRegistrationDto } from 'src/modules/admin/dto/user-status-registration.dto';
import { ChangeUserStatusDto } from 'src/modules/admin/dto/user-status.dto';
import { ChangeUserTypeDto } from 'src/modules/admin/dto/user-type.dto';
import { AdminUserStatusRegistration, USER_STATUS, USER_STATUS_REGISTRATION, USER_TYPE } from 'src/modules/admin/enums';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { HistoryLogService } from 'src/modules/history-log/history-log.service';
import { MailService } from 'src/modules/mail/mail.service';
import { AdminGetPnlDto } from 'src/modules/users/dto/admin-get-pnl.dto';
import { UserLockStatus } from 'src/modules/users/enums/user-status.enum';
import { UsersService } from 'src/modules/users/users.service';
import { WalletService } from 'src/modules/wallets/wallet.service';
import { UserID } from 'src/shares/decorators/get-user-id.decorator';
import { RolesGuardAdmin } from 'src/shares/decorators/role-admin.decorator';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { PoolPnlEntity } from 'src/models/entities/pool_pnl.entity';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuardAdmin)
@Controller('/admin/users')
@ApiTags('admin')
export class UserAdminController {
  constructor(
    private userService: UsersService,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private i18n: I18nService,
    private readonly walletService: WalletService,
    private readonly mailService: MailService,
    private readonly historyLogService: HistoryLogService,
  ) {}

  @Get()
  @ApiOperation({
    description: 'Get all user by admin',
    summary: 'Get users by admin',
  })
  async findAll(
    @Query() { page, limit }: PaginationInput,
    @Query() optionals: SearchUserByAdminDto,
  ): Promise<Response<Partial<User[]>>> {
    return await this.userService.findAll({ page, limit, ...optionals });
  }

  @Put('/change-status-user-type')
  @ApiOperation({
    description: 'Update status user_type of user',
    summary: 'Update status user_type by admin',
  })
  @ApiBody({
    type: ChangeUserTypeDto,
    description: 'usersId: id or list id of users tables, user_type: choose number 0: restricted, 1: unrestricted',
  })
  async changeUserType(@Body() body: { usersId: number[]; user_type: number; adminEmail: string }): Promise<User[]> {
    if (!USER_TYPE.includes(Number(body.user_type))) {
      throw new HttpException('user.USER_STATUS_NOT_EXISTS', HttpStatus.BAD_REQUEST);
    }
    return this.userService.updateUserType(body);
  }

  @Put('/change-status-is-locked')
  @ApiOperation({
    description: 'Update status is_locked of user',
    summary: 'Update status is_locked by admin',
  })
  @ApiBody({
    type: ChangeUserStatusDto,
    description: 'usersId: id or list id of users tables, is_locked: choose number 1 - unlocked, 0 - locked',
  })
  async changeUserStatus(
    @Body() body: { usersId: number[]; is_locked: number },
    @UserID() userId: number,
  ): Promise<User[]> {
    if (!USER_STATUS.includes(Number(body.is_locked))) {
      throw new HttpException('user.USER_STATUS_NOT_EXISTS', HttpStatus.BAD_REQUEST);
    }
    const listUsers = await this.userService.updateUserStatus(body);
    if (body.is_locked === UserLockStatus.Locked) {
      listUsers.forEach((user) => {
        this.historyLogService.logChangeUserStatus(userId, user.id, 'unlocked', 'locked');
      });
    } else {
      listUsers.forEach((user) => {
        this.historyLogService.logChangeUserStatus(userId, user.id, 'locked', 'unlocked');
      });
    }
    return listUsers;
  }

  @Put('/change-status-user-registration')
  @ApiOperation({
    description: 'Update status of user (user registration)',
    summary: 'Update status user (user_registration) by admin',
  })
  @ApiBody({
    type: ChangeUserStatusRegistrationDto,
    description:
      'usersId: id or list id of users tables, user_type: choose number 2 - active, 1 - pending (default), 0 - deactive',
  })
  async changeStatusUserRegistration(
    @Body() body: { usersId: number[]; status: number },
    @UserID() adminId: number,
  ): Promise<User[]> {
    if (!USER_STATUS_REGISTRATION.includes(Number(body.status))) {
      throw new HttpException('user.USER_STATUS_NOT_EXISTS', HttpStatus.BAD_REQUEST);
    }
    const status = body.status == AdminUserStatusRegistration.Active ? 'approved' : 'rejected';
    body.usersId.forEach((userId) => {
      this.historyLogService.logApprovedUser(adminId, userId, status);
    });
    return this.userService.updateStatusUserRegistration(body);
  }

  @Post('/create-admin')
  @ApiOperation({
    description: 'Create Admin by Super Admin',
    summary: 'Create Admin account by Super Admin',
  })
  @ApiBody({
    type: CreateAdminDto,
  })
  async createAdmin(@Body() body: CreateAdminDto, @UserID() adminId: number): Promise<Partial<User>> {
    const RANDOM_PASSWORD = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const user = await this.userService.findUserByEmail(body.email);
    if (user) {
      throw new HttpException({ key: 'user.EXISTS' }, HttpStatus.BAD_REQUEST);
    }
    const rs = await this.userService.createAdmin(body, RANDOM_PASSWORD);
    await this.mailService.sendPasswordAdminQueue(body.email, RANDOM_PASSWORD);
    await this.historyLogService.logCreatedAdmin(adminId, rs.id);
    return rs;
  }

  @ApiOperation({
    description: 'Get user pnl',
  })
  @Get('/pnl')
  async getPnl(@Query() params: AdminGetPnlDto): Promise<PnlEntity[]> {
    return this.userService.getPnls(params.user_id, params.from, params.to, params.wallet);
  }

  @ApiOperation({
    description: 'Get pool user pnl',
  })
  @Get('/pool-pnl')
  async getPoolPnl(@Query() params: AdminGetPnlDto): Promise<PoolPnlEntity[]> {
    return this.userService.getPoolPnls(params.user_id, params.from, params.to, params.wallet);
  }

  @Get(':id')
  @ApiOperation({
    description: 'Get detail user by admin',
    summary: 'Get user by admin',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Id of user in table',
  })
  async findOne(@Param('id') id: number): Promise<Partial<User>> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rs } = await this.userService.findOne({ id });
    return rs;
  }
}
