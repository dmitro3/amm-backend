import { Controller, Post, UseGuards, Request, Body, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from 'src/modules/users/dto/login-user.dto';
import { AuthService } from 'src/modules/auth/auth.service';
import { LocalAuthGuard } from 'src/modules/auth/guards/local-auth.guard';
import { GetAccessTokenForm } from 'src/modules/auth/dto/get-access-token.dto';
import { ResponseUserDto } from 'src/modules/auth/dto/response-user.dto';
import { Request as ReqExpress } from 'express';
import { UserDto } from 'src/modules/users/dto/user.dto';
import { UsersService } from 'src/modules/users/users.service';
import { AdminChangePasswordFirstLogin } from 'src/modules/admin/dto/admin-change-password-first-login.dto';
import { Roles } from 'src/modules/roles/roles.decorator';
import { Role } from 'src/modules/roles/enums/role.enum';
import { I18nService } from 'nestjs-i18n';
import { FORBIDDEN } from 'src/shares/constants/httpExceptionSubCode.constant';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private i18n: I18nService,
  ) {}

  @Post('/verify-email')
  async verifyEmail(@Query('token') token: string): Promise<string> {
    await this.authService.verifyEmail(token);

    return 'OK';
  }

  @UseGuards(LocalAuthGuard)
  @ApiBody({
    type: LoginUserDto,
  })
  @Post('login')
  @ApiBearerAuth()
  async login(@Request() req: ReqExpress): Promise<Partial<ResponseUserDto>> {
    return this.authService.login(req);
  }

  @Post('access-token')
  @ApiBody({
    type: GetAccessTokenForm,
  })
  async getAccessToken(@Body('refreshToken') refreshToken: string): Promise<Partial<ResponseUserDto>> {
    return this.authService.getAccessToken(refreshToken);
  }

  @UseGuards(LocalAuthGuard)
  @ApiBody({
    type: LoginUserDto,
  })
  @Post('admin/login')
  @ApiBearerAuth()
  async loginAmin(@Request() req: ReqExpress & { user: UserDto }): Promise<Partial<ResponseUserDto>> {
    if (![Role.Admin, Role.SuperAdmin].includes(req.user.role))
      throw new HttpException({ key: 'user.NOT_ADMIN', code: FORBIDDEN.WRONG_EMAIL }, HttpStatus.FORBIDDEN);

    return this.authService.login(req);
  }

  @Post('admin/admin-change-password-first-login')
  @ApiBody({
    type: AdminChangePasswordFirstLogin,
  })
  @ApiBearerAuth()
  @UseGuards(LocalAuthGuard)
  @Roles(Role.Admin, Role.SuperAdmin)
  async adminChangePasswordFirstLogin(
    @Request() req: ReqExpress & { user: UserDto },
    @Body() body: AdminChangePasswordFirstLogin,
  ): Promise<string> {
    await this.usersService.updatePassword(req.user.email, body.newPassword);
    await this.usersService.setFirstLogin(req.user.id, false);
    return this.i18n.translate('admin.CHANGED_DEFAULT_PASSWORD_SUCCESSFULLY', {});
  }
}
