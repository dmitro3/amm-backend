// eslint-disable-next-line @typescript-eslint/no-var-requires
const FormData = require('form-data');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios');
import { CACHE_MANAGER, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/modules/users/users.service';
import { UserLockStatus, UserStatus } from 'src/modules/users/enums/user-status.enum';
import { Cache } from 'cache-manager';
import { AuthErrorStatus, jwtConstants } from 'src/modules/auth/constants';
import { LoginHistories } from 'src/models/entities/login-histories.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ResponseUserDto } from 'src/modules/auth/dto/response-user.dto';
import { User } from 'src/models/entities/users.entity';
import { UserRepository } from 'src/models/repositories/user.repository';
import { FORBIDDEN } from 'src/shares/constants/httpExceptionSubCode.constant';
import { getConfig } from 'src/configs';
import { Role } from 'src/modules/roles/enums/role.enum';

const refreshTokenConfig = {
  expiresIn: jwtConstants.refreshTokenExpires,
  secret: jwtConstants.refreshTokenSecret,
};

@Injectable()
export class AuthService {
  private INCORRECT_TIMES = 4;
  private INCORRECT_TIMES_TTL = 60 * 10;

  constructor(
    private usersService: UsersService,
    @InjectRepository(User, 'master')
    private usersRepository: UserRepository,
    @InjectRepository(User, 'report')
    private usersRepositoryReport: UserRepository,
    @InjectRepository(LoginHistories, 'master')
    private loginHistoriesRepo: Repository<LoginHistories>,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async validateUser(email: string, pass: string): Promise<Partial<User>> {
    const user = await this.usersService.findUserByEmailOptions({ email });

    const correctPass = await bcrypt.compare(pass, user.password);

    /*
      wrong password five times in 10p => lock account
      redisKey and redisValue for number of times wrong password
     */
    const redisKey = `incorrect_pass_user_${user.id}`;
    const redisValue = await this.cache.get(redisKey);
    const count = Number(redisValue ?? 0);

    if (!correctPass && count >= this.INCORRECT_TIMES) {
      await Promise.all([this.cache.del(redisKey), await this.usersService.lock(user.id)]);
      throw new HttpException({ key: 'user.ACCOUNT_LOCKED', code: FORBIDDEN.LOCK_ACCOUNT }, HttpStatus.FORBIDDEN);
    }
    if (!correctPass && user.locked != UserLockStatus.Locked) {
      await this.cache.set(redisKey, count + 1, { ttl: this.INCORRECT_TIMES_TTL });
      throw new HttpException(
        {
          key: 'user.WRONG_EMAIL_OR_PASS',
          args: { num: `${this.INCORRECT_TIMES - count}` },
          code: FORBIDDEN.WRONG_PASS,
        },
        HttpStatus.FORBIDDEN,
      );
    }

    await this.cache.del(redisKey);
    return {
      id: user.id,
      email: user.email,
      locked: user.locked,
      is_first_login: user.is_first_login,
      company: user.company,
      fullname: user.fullname,
      phone: user.phone,
      velo_account: user.velo_account,
      role: user.role,
      created_at: user.created_at,
    };
  }

  async verifyEmail(verify_email_token: string): Promise<void> {
    const verifyEmailTokenDecode = await this.usersService.decodeJWTVerifyToken(verify_email_token);

    const userId = verifyEmailTokenDecode.sub;
    const user = await this.usersService.findUserById(userId);

    if (!user) throw new HttpException({ key: 'user.NOT_EXISTS' }, HttpStatus.NOT_FOUND);

    if (user.locked == UserLockStatus.Locked) {
      throw new HttpException({ key: 'user.ACCOUNT_LOCKED', code: FORBIDDEN.ACCOUNT_LOCKED }, HttpStatus.FORBIDDEN);
    }

    if (user.status !== UserStatus.Submit)
      throw new HttpException({ key: 'user.USER_EMAIL_VERIFIED' }, HttpStatus.NOT_ACCEPTABLE);

    user.status = UserStatus.PendingActive;

    await this.usersRepository.save(user);
  }

  async validateGoogleCaptcha(response: string): Promise<boolean> {
    const secret = getConfig().get<string>('google_recaptcha_secret');
    const verifyUrl = getConfig().get<string>('google_verify_captcha_url');
    const bodyFormData = new FormData();
    bodyFormData.append('secret', secret);
    bodyFormData.append('response', response);
    const data = await axios.post(verifyUrl, bodyFormData, {
      headers: bodyFormData.getHeaders(),
    });
    return data.data.success;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async login(req): Promise<ResponseUserDto> {
    const isCaptchaValid = await this.validateGoogleCaptcha(req.body.isVerify);
    if (!isCaptchaValid) {
      throw new HttpException(
        { message: 'user.INVALID_GOOGLE_CAPTCHA', code: AuthErrorStatus.InvalidGoogleCaptcha },
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = req.user;
    const isAdmin = [Role.Admin, Role.SuperAdmin].includes(user.role);

    // If is admin or superAdmin
    if (isAdmin && user.is_first_login) {
      throw new HttpException(
        { key: 'admin.ADMIN_NOT_CHANGED_DEFAULT_PASSWORD', code: FORBIDDEN.ADMIN_NOT_CHANGED_DEFAULT_PASSWORD },
        HttpStatus.FORBIDDEN,
      );
    }

    const payload = { sub: user.id };
    const refreshTokenPayload = { sub: user.id };
    const listUserFunCurrencies = await this.usersRepositoryReport.getListUserFunCurrencies(user.id);
    const ip = req.connection.remoteAddress;
    const last_login = await this.usersRepositoryReport.getLastLogin(user.id);

    const response = {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(refreshTokenPayload, refreshTokenConfig),
      id: user.id,
      email: user.email,
      company: user.company,
      fullname: user.fullname,
      phone: user.phone,
      velo_account: user.velo_account,
      role: user.role,
      created_at: user.created_at,
      listUserFunCurrencies: listUserFunCurrencies,
      IP: ip,
      last_login: last_login?.last_login ? last_login?.last_login : user.created_at,
    };

    const loginHistories = { user_id: user.id, ip: ip };
    await this.loginHistoriesRepo.save(loginHistories);

    await this.usersService.setRefreshToken(response.refresh_token, user.id);

    return response;
  }

  async getAccessToken(refreshToken: string): Promise<{ access_token: string }> {
    let refreshTokenDecode;
    try {
      refreshTokenDecode = await this.jwtService.verify(refreshToken, refreshTokenConfig);
    } catch (e) {
      throw new HttpException({ key: 'user.INVALID_TOKEN' }, HttpStatus.UNAUTHORIZED);
    }

    const userId = refreshTokenDecode.sub;
    const user = await this.usersService.getUserIfRefreshTokenMatch(refreshToken, userId);
    const payload = { sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
