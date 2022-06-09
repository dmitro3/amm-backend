import {
  Body,
  CACHE_MANAGER,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { I18nService } from 'nestjs-i18n';
import { Coin } from 'src/models/entities/coin.entity';
import { IntervalSettings } from 'src/models/entities/interval-settings.entity';
import { PoolEntity } from 'src/models/entities/pool.entity';
import { TradingFee } from 'src/models/entities/trading-fee.entity';
import { UserWallet } from 'src/models/entities/user-wallet.entity';
import { User } from 'src/models/entities/users.entity';
import { AdminService } from 'src/modules/admin/admin.services';
import { CollectedFeeResDto } from 'src/modules/admin/dto/collected-fee-res.dto';
import { DigitalCreditFilterDto } from 'src/modules/admin/dto/get-digital-credit-settings.dto';
import { ChangePoolRequestStatusDto } from 'src/modules/admin/dto/poll-request-status.dto';
import { PoolRequestFilterDto } from 'src/modules/admin/dto/pool-request-filter.dto';
import { UserDeactive } from 'src/modules/auth/dto/user-disactive.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CoinService } from 'src/modules/coins/coin.service';
import { HistoryLogService } from 'src/modules/history-log/history-log.service';
import { MailService } from 'src/modules/mail/mail.service';
import { SearchOrderDto } from 'src/modules/orders/dto/search_order.dto';
import { OrdersService } from 'src/modules/orders/orders.service';
import { PoolsService } from 'src/modules/pools/pools.service';
import { Role } from 'src/modules/roles/enums/role.enum';
import { Roles } from 'src/modules/roles/roles.decorator';
import { UpdateTradingFeeDto } from 'src/modules/tradingfee/dto/update-tradingfee.dto';
import { TradingFeeService } from 'src/modules/tradingfee/tradingfee.service';
import { ApproveDto } from 'src/modules/users/dto/approve.dto';
import { CheckResetPassTokenDto } from 'src/modules/users/dto/check-reset-pass-token.dto';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { EmailDto } from 'src/modules/users/dto/email.dto';
import { ForgotPassForm } from 'src/modules/users/dto/forgot-pass.dto';
import { IntervalSettingsDto } from 'src/modules/users/dto/interval-settings.dto';
import { ResetPasswordDto } from 'src/modules/users/dto/reset-password.dto';
import { UnlockAccountDto } from 'src/modules/users/dto/unlock.dto';
import { UserActiveToken } from 'src/modules/users/dto/user-active.dto';
import { WrapIntervalSettingsDto } from 'src/modules/users/dto/wrap-interval-settings.dto';
import { UserStatus, UserTypeStatus } from 'src/modules/users/enums/user-status.enum';
import { UsersService } from 'src/modules/users/users.service';
import { WalletService } from 'src/modules/wallets/wallet.service';
import { RolesGuardAdmin } from 'src/shares/decorators/role-admin.decorator';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { WalletStatus } from 'src/modules/wallets/enums/wallet.enum';
import { ApproveWalletDto } from 'src/modules/admin/dto/approve-wallet.dto';
import { CollectedFeesDto } from 'src/modules/admin/dto/collected-fees.dto';
import { DownloadCollectedFeerequest } from 'src/modules/admin/dto/download-collected-fee-request.dto';
import { DownloadCollectedFeeResponse } from 'src/modules/admin/dto/download-collected-fee-response.dto';
import { UserOptionalDto } from 'src/modules/admin/dto/user-optional.dto';
import { TradeService } from 'src/modules/trades/trades.service';
import { SearchTradeDto } from 'src/modules/orders/dto/search_trade.dto';
import { TradeEntity } from 'src/models/entities/trade.entity';
import { ConditionTransactionDto } from 'src/modules/trades/dto/condition-transaction.dto';
import { NotificationPoolSwapDto } from 'src/modules/notifications/dto/notification-pool-swap.dto';
import { NotificationService } from 'src/modules/notifications/notification.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuardAdmin)
@Controller('admin')
@ApiTags('admin')
export class AdminController {
  constructor(
    private userService: UsersService,
    private mailService: MailService,
    private walletService: WalletService,
    private coinService: CoinService,
    private poolsService: PoolsService,
    private adminService: AdminService,
    private orderService: OrdersService,
    private tradeService: TradeService,
    private tradingFeeService: TradingFeeService,
    private notificationService: NotificationService,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private i18n: I18nService,
    private historyLogService: HistoryLogService,
  ) {}

  @Post()
  async create(@Body() userDto: CreateUserDto): Promise<User> {
    const { email } = userDto;

    // check if the user exists in the db
    const userInDb = await this.userService.findUserByEmail(email);

    if (userInDb) {
      throw new HttpException({ key: 'user.EXISTS' }, HttpStatus.BAD_REQUEST);
    }
    await this.userService.createUser(userDto);

    return this.i18n.translate('user.CREATE_SUCCESS', {});
  }

  @Post('check-valid-email')
  @ApiBody({
    type: EmailDto,
  })
  @ApiOperation({
    description: `Api check mail có thể dùng được hay không`,
  })
  async checkEmailCanUse(@Body('email') email: string): Promise<string> {
    const userInDb = await this.userService.findUserByEmail(email);
    if (userInDb) {
      throw new HttpException({ key: 'user.EMAIL_CANNOT_USE' }, HttpStatus.NOT_ACCEPTABLE);
    }

    return this.i18n.translate('user.EMAIL_CAN_USE', {});
  }

  @Get('/confirm')
  @HttpCode(200)
  async active(@Query('token') token: string): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tokenDecoded: UserActiveToken | any;
    try {
      tokenDecoded = await this.cache.get(token);
      if (!tokenDecoded) throw 'Error';
    } catch (e) {
      // logger
      return this.i18n.translate('user.INVALID_TOKEN', {});
    }

    // token validated
    try {
      await this.cache.del(token);
      await this.userService.changeUserStatus(tokenDecoded.userId, UserStatus.Active);
    } catch (e) {
      // logger
      throw new HttpException({ key: 'user.INTERNAL_SERVER_ERROR' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return this.i18n.translate('user.ACCOUNT_ACTIVATED', {});
  }

  @Post('/change-user-status')
  @ApiBody({
    type: UserDeactive,
  })
  async changeUserStatus(@Body('userIds') userIds: number[], @Body('userStatus') status: number): Promise<unknown> {
    const res = this.userService.changeUserStatus(userIds, status);
    if (!res) throw new HttpException('user.INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    return this.i18n.translate('user.STATUS_CHANGE_SUCCESS', {});
  }

  @Post('/change-user-type')
  @ApiBody({
    type: UserDeactive,
  })
  async changeUserType(@Body('userIds') userIds: number[], @Body('userType') userType: number): Promise<unknown> {
    const res = this.userService.changeUserType(userIds, userType);
    if (!res) throw new HttpException('user.INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    return this.i18n.translate('user.CHANGE_USER_TYPE_SUCCESS', {});
  }

  @Post('resend-email')
  async resendConfirmationEmail(@Body('email') email: string): Promise<string> {
    const user = await this.userService.findUserByEmail(email);

    try {
      await this.sendConfirmationEmail(user);
    } catch {
      throw new HttpException('user.INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return this.i18n.translate('user.CF_MAIL_SENT', {});
  }

  private async sendConfirmationEmail(user: User): Promise<string> {
    const token = await this.userService.generateActiveToken(user.id);
    await this.mailService.sendConfirmationEmail(user, token);

    return token;
  }

  @Post('forgot-password')
  @ApiBody({
    type: ForgotPassForm,
  })
  async forgotPassword(@Body('email') email: string): Promise<string> {
    const token = await this.userService.generateResetPasswordToken(email);

    await this.mailService.sendForgotPasswordEmailJob(email, token);
    return this.i18n.translate('user.FORGOT_PASS_TOKEN_SENT', {});
  }

  @Post('check-pass-token')
  @HttpCode(200)
  @ApiBody({
    type: CheckResetPassTokenDto,
  })
  async checkPassToken(@Body('token') token: string, @Body('email') email: string): Promise<boolean> {
    const isValid = await this.userService.checkPassToken(email, token);
    if (!isValid) throw new HttpException('user.INVALID_TOKEN', HttpStatus.NOT_ACCEPTABLE);
    return isValid;
  }

  @Put('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<string> {
    const { email, password, token } = resetPasswordDto;

    const isValid = await this.userService.checkPassToken(email, token);
    if (!isValid) throw new HttpException('user.INVALID_TOKEN', HttpStatus.NOT_ACCEPTABLE);

    const success = await this.userService.updatePassword(email, password);

    if (!success) throw new HttpException('user.INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);

    return this.i18n.translate('user.RESET_PASSWORD_SUCCEED', {});
  }

  @Post('approve')
  @ApiBody({
    type: ApproveDto,
  })
  async approveRegistration(@Body('user_id') userId: number): Promise<string> {
    const user = await this.userService.findUserById(userId);

    try {
      await this.sendConfirmationEmail(user);
    } catch {
      throw new HttpException('user.APPROVED_REGISTRATION_FAILED', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return this.i18n.translate('user.APPROVED_REGISTRATION', {});
  }

  @Post('unlock')
  @ApiBody({
    type: UnlockAccountDto,
  })
  @ApiOperation({
    description: 'Unlock account từ user id',
  })
  async unlock(@Body('user_id') userId: number): Promise<string> {
    const success = await this.userService.unlock(userId);

    if (!success) throw new HttpException('user.UNLOCK_FAILED', HttpStatus.INTERNAL_SERVER_ERROR);

    return this.i18n.translate('user.UNLOCK_SUCCESS', {});
  }

  @Put('update-general-setting')
  @ApiBody({
    type: IntervalSettingsDto,
  })
  @ApiOperation({
    description: 'Admin upload csv file',
  })
  async adminUploadCsv(@Body() uploadFileDtos: WrapIntervalSettingsDto): Promise<Response<IntervalSettings[]>> {
    return this.adminService.saveIntervalSettings(uploadFileDtos);
  }

  @Get('/get-digital-credit-settings')
  @ApiQuery({
    type: UserDeactive,
  })
  @ApiOperation({
    description: 'Get Digital Credit info with Condition (status and name)',
  })
  async getDigitalCreditSetting(
    @Query() { page, limit }: PaginationInput,
    @Query() { digital_credit, status }: DigitalCreditFilterDto,
  ): Promise<Response<Coin[]>> {
    return this.coinService.getAllDigitalCreditSettings(digital_credit, status, page, limit);
  }

  @Get('/disable-admin/:id')
  @Roles(Role.SuperAdmin)
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Id of user in table',
  })
  @ApiOperation({
    description: 'Supper Admin disable admin',
  })
  async disableAdmin(@Param('id') id: number): Promise<User> {
    const disableResult = await this.adminService.disableAdmin(id);
    return disableResult;
  }

  @Get('/enable-admin/:id')
  @Roles(Role.SuperAdmin)
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Id of user in table',
  })
  @ApiOperation({
    description: 'Supper Admin enable admin',
  })
  async enableAdmin(@Param('id') id: number): Promise<User> {
    const userResponse = await this.adminService.enableAdmin(id);
    return userResponse;
  }

  @Get('/whitelist-address')
  @Roles(Role.SuperAdmin)
  @ApiParam({
    name: 'page, limit',
    type: PaginationInput,
    description: 'paging',
  })
  @ApiOperation({
    description: 'Supper whitelist admin',
  })
  async adminWhitelist(
    @Query() { page, limit }: PaginationInput,
    @Query() optional: UserOptionalDto,
  ): Promise<Response<Partial<UserWallet[]>>> {
    optional.role = UserTypeStatus.Admin;
    return this.walletService.findAllWallet(page, limit, optional);
  }

  @Get('/pool-requests')
  @ApiOperation({
    description: 'Get Pool requests',
  })
  async getPoolRequests(
    @Query() { page, limit }: PaginationInput,
    @Query() filter: PoolRequestFilterDto,
  ): Promise<Response<PoolEntity[]>> {
    return this.poolsService.getPoolRequests(filter, page, limit);
  }

  @Get('/pool-requests/:id')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Id of pool request in table',
  })
  @ApiOperation({
    description: 'Get Pool request',
  })
  async getPoolRequest(@Param('id') id: number): Promise<PoolEntity> {
    return this.poolsService.getPoolRequest(id);
  }

  @Patch('/pool-requests/:id')
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Id of pool request in table',
  })
  @ApiBody({
    type: ChangePoolRequestStatusDto,
  })
  @ApiOperation({
    description: 'Reject or approve a Pool request',
  })
  async updatePoolRequest(
    @Param('id') id: number,
    @Body() updatePoolRequestDto: ChangePoolRequestStatusDto,
  ): Promise<PoolEntity> {
    return this.poolsService.updatePoolRequest(id, updatePoolRequestDto);
  }

  @Get('/check-wallet-address/:address')
  @ApiParam({
    name: 'address',
    type: String,
    description: 'address of wallet',
  })
  @ApiOperation({
    description: 'Check exists wallet address',
  })
  async existWalletAddress(@Param('address') address: string): Promise<boolean> {
    return this.adminService.checkExistWalletAddress(address);
  }

  @ApiOperation({
    description: 'Get list orders',
  })
  @Get('/orders/list')
  async getListOrders(
    @Query() { page, limit }: PaginationInput,
    @Query() searchOrderDto: SearchOrderDto,
  ): Promise<{ data; metadata }> {
    return await this.orderService.getListOrders(searchOrderDto, page, limit);
  }

  @ApiOperation({
    description: 'Get trade history',
  })
  @Get('/trades/list')
  async getListTradeHistory(
    @Query() { page, limit }: PaginationInput,
    @Query() searchOrderDto: SearchTradeDto,
  ): Promise<Response<TradeEntity[]>> {
    return this.tradeService.getAllTrades(searchOrderDto, page, limit);
  }

  @ApiOperation({
    summary: 'Get trade liquidity admin',
  })
  @UseGuards(RolesGuardAdmin)
  @Post('/getTransactionLiq')
  async getTradeSwapAdmin(@Body() condition: ConditionTransactionDto): Promise<unknown> {
    return this.tradeService.getTradeLiquidity(condition);
  }
  @Get('/collected-fee')
  @Roles(Role.SuperAdmin)
  @ApiParam({
    name: 'calc collected fee',
    type: String,
    description: 'address of wallet',
  })
  @ApiOperation({
    description: 'Calc collected fee',
  })
  async collectedFees(@Query() optionals: CollectedFeesDto): Promise<CollectedFeeResDto[]> {
    return await this.adminService.getCollectedFees(optionals);
  }

  @Post('/approve-wallet')
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiParam({
    name: 'Admin approve wallet',
    type: String,
    description: 'Admin approve wallet',
  })
  @ApiOperation({
    description: 'Admin approve wallet',
  })
  async approveWalletLog(@Body() optionals: ApproveWalletDto): Promise<boolean> {
    this.historyLogService.logChangeWhiteList(optionals.adminId, optionals.walletAddress, WalletStatus.Approved);
    return true;
  }

  @Post('/reject-wallet')
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiParam({
    name: 'Admin reject wallet',
    type: String,
    description: 'Admin reject wallet',
  })
  @ApiOperation({
    description: 'Admin reject wallet',
  })
  async rejectWalletLog(@Body() optionals: ApproveWalletDto): Promise<boolean> {
    this.historyLogService.logChangeWhiteList(optionals.adminId, optionals.walletAddress, WalletStatus.Blocked);
    return true;
  }

  @Get('/download-collected-fee')
  @Roles(Role.SuperAdmin)
  @ApiParam({
    name: 'get info to csv',
    type: String,
    description: 'get info to csv',
  })
  @ApiOperation({
    description: 'get info to csv',
  })
  async downloadCollectedFeeCsv(
    @Query() optionals: DownloadCollectedFeerequest,
  ): Promise<DownloadCollectedFeeResponse> {
    return await this.adminService.downloadCollectedFee(optionals);
  }

  @ApiOperation({
    description: 'Create pool swap notification',
  })
  @Post('pool-swap')
  async createPoolSwapNotification(@Body() notificationPoolSwapDto: NotificationPoolSwapDto): Promise<boolean> {
    return await this.notificationService.createPoolSwapNotification(notificationPoolSwapDto);
  }

  @Put('trading-fee/:id')
  @ApiBody({
    type: UpdateTradingFeeDto,
  })
  @Roles(Role.SuperAdmin)
  update(@Param('id') id: number, @Body() tradingFee: UpdateTradingFeeDto): Promise<TradingFee> {
    return this.tradingFeeService.update(id, tradingFee);
  }
}
