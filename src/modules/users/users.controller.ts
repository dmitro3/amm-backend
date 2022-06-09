import {
  Body,
  CACHE_MANAGER,
  Controller,
  forwardRef,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { Response as ResponData } from 'src/shares/interceptors/response.interceptor';
import { I18nService } from 'nestjs-i18n';
import { getConfig } from 'src/configs';
import { ConfigIntervalEntity } from 'src/models/entities/config-interval.entity';
import { User } from 'src/models/entities/users.entity';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { MailService } from 'src/modules/mail/mail.service';
import { Role } from 'src/modules/roles/enums/role.enum';
import { Roles } from 'src/modules/roles/roles.decorator';
import { RolesGuard } from 'src/modules/roles/roles.guard';
import { ApproveDto } from 'src/modules/users/dto/approve.dto';
import { ChangePassDto } from 'src/modules/users/dto/change-pass.dto';
import { CheckResetPassTokenDto } from 'src/modules/users/dto/check-reset-pass-token.dto';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { EmailDto } from 'src/modules/users/dto/email.dto';
import { ForgotPassForm } from 'src/modules/users/dto/forgot-pass.dto';
import { GetPnlDto } from 'src/modules/users/dto/get-pnl.dto';
import { ResetPasswordDto } from 'src/modules/users/dto/reset-password.dto';
import { UnlockAccountDto } from 'src/modules/users/dto/unlock.dto';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import { UserActiveToken } from 'src/modules/users/dto/user-active.dto';
import { UserStatus } from 'src/modules/users/enums/user-status.enum';
import { UsersService } from 'src/modules/users/users.service';
import { WalletService } from 'src/modules/wallets/wallet.service';
import { UserID } from 'src/shares/decorators/get-user-id.decorator';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { IntervalSettingsDto } from 'src/modules/users/dto/interval-settings.dto';
import { isStellarAccountActive } from 'src/shares/helpers/stellar-check-address';
import { PnlEntity } from 'src/models/entities/pnl.entity';
import { JwtService } from '@nestjs/jwt';
import { PoolPnlEntity } from 'src/models/entities/pool_pnl.entity';

@Controller('users')
@ApiBearerAuth()
@ApiTags('User')
export class UsersController {
  private FCX_PAGE = getConfig().get<string>('fcx.page');

  constructor(
    private userService: UsersService,
    private mailService: MailService,
    private jwtService: JwtService,
    @Inject(forwardRef(() => WalletService))
    private walletService: WalletService,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private i18n: I18nService,
  ) {}

  @ApiOperation({
    operationId: 'createUser',
    summary: 'Create User',
    description: 'Create User',
  })
  @Post()
  async create(@Body() userDto: CreateUserDto): Promise<User> {
    const { email } = userDto;

    // check if the user exists in the db
    const userInDb = await this.userService.findUserByEmail(email);

    if (userInDb) {
      throw new HttpException({ key: 'user.EXISTS' }, HttpStatus.BAD_REQUEST);
    }
    await this.userService.createUser(userDto);

    // Send verify email
    const verifyEmailToken = await this.userService.getVerifyEmailToken(email);

    const verifyEmailUrl = `${this.FCX_PAGE}/verify-email?token=${verifyEmailToken}`;

    await this.mailService.sendVerifyEmailJob(email, verifyEmailUrl);

    return this.i18n.translate('user.CREATE_SUCCESS', {});
  }

  @ApiOperation({
    operationId: 'resendVerifyEmail',
    summary: 'Resend Verify Email',
    description: 'Resend Verify Email',
  })
  @Post('/resend-verify-email/:email')
  async resendVerifyEmail(@Param('email') email: string): Promise<string> {
    const verifyEmailToken = await this.userService.getVerifyEmailToken(email);

    const verifyEmailUrl = `${this.FCX_PAGE}/verify-email?token=${verifyEmailToken}`;

    await this.mailService.sendVerifyEmailJob(email, verifyEmailUrl);

    return this.i18n.translate('user.RESEND_VERIFY_EMAIL_SUCCESS', {});
  }

  @ApiOperation({
    operationId: 'updateFunCurrencies',
    summary: 'Update funtion currencies',
    description: 'Update funtion currencies',
  })
  @Post('update-list-fun-currencies')
  @ApiBody({
    type: UpdateUserDto,
  })
  async updatelistUserFunCurrencies(@Body() userDto: UpdateUserDto, @UserID() userId: number): Promise<User> {
    userDto.userId = userId;
    await this.userService.updatelistUserFunCurrencies(userDto);

    return this.i18n.translate('user.UPDATE_SUCCESS', {});
  }

  @ApiOperation({
    operationId: 'checkValidEmail',
    summary: 'Check valid Email',
    description: 'Check valid Email',
  })
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

  @ApiOperation({
    operationId: 'resendEmail',
    summary: 'Resend email',
    description: 'Resend email',
  })
  @Post('resend-email')
  @Roles(Role.Admin, Role.SuperAdmin)
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

  @ApiOperation({
    operationId: 'forgotPassword',
    summary: 'Forgot password',
    description: 'Forgot password',
  })
  @Post('forgot-password')
  @ApiBody({
    type: ForgotPassForm,
  })
  async forgotPassword(@Body('email') email: string): Promise<string> {
    const token = await this.userService.generateResetPasswordToken(email);

    await this.mailService.sendForgotPasswordEmailJob(email, token);
    return this.i18n.translate('user.FORGOT_PASS_TOKEN_SENT', {});
  }

  @ApiOperation({
    operationId: 'checkPassToken',
    summary: 'Check token',
    description: 'Check token',
  })
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

  @ApiOperation({
    operationId: 'resetPassword',
    summary: 'Reset password',
    description: 'Reset password',
  })
  @Put('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<string> {
    const { email, password, token } = resetPasswordDto;

    const isValid = await this.userService.checkPassToken(email, token);
    if (!isValid) throw new HttpException('user.INVALID_TOKEN', HttpStatus.NOT_ACCEPTABLE);

    const success = await this.userService.updatePassword(email, password);

    if (!success) throw new HttpException('user.INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);

    await this.mailService.sendPasswordChangedEmailJob(email);
    return this.i18n.translate('user.RESET_PASSWORD_SUCCEED', {});
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBody({
    type: ChangePassDto,
  })
  async changePassword(@Body() changePassDto: ChangePassDto, @UserID() userId: number): Promise<string> {
    const success = await this.userService.changePassword(changePassDto, userId);

    if (!success) throw new HttpException('user.INTERNAL_SERVER_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
    return this.i18n.translate('user.CHANGE_PASSWORD_SUCCEED', {});
  }

  @Post('approve')
  @ApiBody({
    type: ApproveDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  async approveRegistration(@Body('user_id') userId: number): Promise<string> {
    const user = await this.userService.findUserById(userId);

    try {
      await this.sendConfirmationEmail(user);
    } catch {
      throw new HttpException('user.APPROVED_REGISTRATION_FAILED', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return this.i18n.translate('user.APPROVED_REGISTRATION', {});
  }

  @ApiOperation({
    operationId: 'getMe',
    summary: 'Get user login profile',
    description: 'Get user login profile',
  })
  @Get('me')
  @ApiOperation({
    description: 'get profile',
  })
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: unknown, @UserID() userId: number): Promise<unknown> {
    return this.userService.getProfile(req, userId);
  }

  @Post('unlock')
  @ApiBody({
    type: UnlockAccountDto,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  @ApiOperation({
    description: 'Unlock account từ user id',
  })
  async unlock(@Body('user_id') userId: number): Promise<string> {
    const success = await this.userService.unlock(userId);

    if (!success) throw new HttpException('user.UNLOCK_FAILED', HttpStatus.INTERNAL_SERVER_ERROR);

    return this.i18n.translate('user.UNLOCK_SUCCESS', {});
  }

  @ApiOperation({
    description: 'Get user pnl',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/pnl')
  async getPnl(@Query() params: GetPnlDto, @UserID() userId: number): Promise<PnlEntity[]> {
    return this.userService.getPnls(userId, params.from, params.to, params.wallet);
  }

  @ApiOperation({
    description: 'Get user pool pnl',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/pool-pnl')
  async getPoolPnl(@Query() params: GetPnlDto, @UserID() userId: number): Promise<PoolPnlEntity[]> {
    return this.userService.getPoolPnls(userId, params.from, params.to, params.wallet);
  }

  @Get('/volatility')
  async getVolatility(@UserID() userId: number): Promise<{ interval: number; annualized: string }> {
    return await this.userService.getVolatilityByUser(userId);
  }

  @Put('/volatility/:interval')
  @ApiParam({ name: 'interval' })
  async createOrUpdateVolatility(
    @Param() param: { interval: number },
    @UserID() userId: number,
  ): Promise<ConfigIntervalEntity> {
    return await this.userService.createOrUpdateVolatility(param.interval, userId);
  }

  @Put('/confidence/:interval')
  @ApiParam({ name: 'interval' })
  async createOrUpdateConfidence(
    @Param() param: { interval: number },
    @UserID() userId: number,
  ): Promise<ConfigIntervalEntity> {
    return await this.userService.createOrUpdateConfidence(param.interval, userId);
  }

  @Get('/confidence')
  async getConfidence(@UserID() userId: number): Promise<{ interval: number; calculation: number }> {
    return await this.userService.getConfidence(userId);
  }

  @Get('/get-general')
  @ApiQuery({
    type: IntervalSettingsDto,
  })
  @ApiOperation({
    description: 'Get List interval settings',
  })
  async getIntervalSettings(@Query() { page, limit }: PaginationInput): Promise<ResponData<IntervalSettingsDto[]>> {
    return this.userService.getAllIntervalSettings(page, limit);
  }

  // VALIDATE WALLET ADDRESS
  @Get('/check-wallet-address-network/:address')
  @ApiParam({
    name: 'address',
    type: String,
    description: 'Wallet address',
  })
  @ApiOperation({
    operationId: 'Check wallet address network',
    summary: 'Check wallet address network',
    description: 'Check wallet address network',
  })
  async checkWalletAddressNetwork(@Param('address') address: string): Promise<number> {
    return this.walletService.checkWalletAddressNetwork(address);
  }

  @Get('/check-wallet-address-exists/:address')
  @ApiParam({
    name: 'address',
    type: String,
    description: 'Wallet address',
  })
  @ApiOperation({
    operationId: 'Check if wallet address exists',
    summary: 'Check if wallet address exists',
    description: 'Check if wallet address exists',
  })
  async ifWalletAddressExist(@Param('address') address: string): Promise<boolean> {
    return this.walletService.isWalletAddressExist(address);
  }

  @Get('/check-wallet-stellar-address-active/:address')
  @ApiParam({
    name: 'address',
    type: String,
    description: 'Wallet address',
  })
  @ApiOperation({
    operationId: 'Check if wallet stellar address active',
    summary: 'Check if wallet stellar address active',
    description: 'Check if wallet stellar address active',
  })
  async ifWalletStellarAddressExist(@Param('address') address: string): Promise<boolean> {
    return await isStellarAccountActive(address);
  }

  @Get('/check-wallet-address-trustline/:address')
  @ApiParam({
    name: 'address',
    type: String,
    description: 'Wallet address',
  })
  @ApiOperation({
    operationId: 'Check wallet address trustline',
    summary: 'Check wallet address trustline',
    description: 'Check wallet address trustline',
  })
  async ifWalletAddressTrustline(@Param('address') address: string): Promise<boolean> {
    return this.walletService.checkWalletAddressTrustline(address);
  }
}
