import { BigNumber } from '@0x/utils';
import { CACHE_MANAGER, ForbiddenException, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { hash } from 'bcrypt';
import { Cache } from 'cache-manager';
import { plainToClass } from 'class-transformer';
import { getConfig } from 'src/configs';
import {
  CALCULATION_INTERVAL_CONFIDENCE,
  ConfigIntervalEntity,
  ConfigIntervalErrorStatus,
  ConfigIntervalType,
  DEFAULT_INTERVAL,
} from 'src/models/entities/config-interval.entity';
import { FunctionalCurrencyUsers } from 'src/models/entities/fun-currency-user.entity';
import { ActivityType, HistoryLogEntity } from 'src/models/entities/history-log.entity';
import { IntervalSettings } from 'src/models/entities/interval-settings.entity';
import { PnlEntity } from 'src/models/entities/pnl.entity';
import { UserWallet } from 'src/models/entities/user-wallet.entity';
import { User } from 'src/models/entities/users.entity';
import { ConfigIntervalRepository } from 'src/models/repositories/config-interval.respository';
import { HistoryLogRepository } from 'src/models/repositories/history-log.repository';
import { IntervalSettingRepository } from 'src/models/repositories/interval-settings.repository';
import { PnlRepository } from 'src/models/repositories/pnl.repository';
import { UserRepository } from 'src/models/repositories/user.repository';
import { CreateAdminDto } from 'src/modules/admin/dto/create-admin.dto';
import { SearchUserByAdminDto } from 'src/modules/admin/dto/query.admin.user';
import { jwtConstants } from 'src/modules/auth/constants';
import { MailService } from 'src/modules/mail/mail.service';
import { Role } from 'src/modules/roles/enums/role.enum';
import { ChangePassDto } from 'src/modules/users/dto/change-pass.dto';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { IntervalSettingsDto } from 'src/modules/users/dto/interval-settings.dto';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import { FuntionalCurrenciesStatus } from 'src/modules/users/enums/funtional_currencies_status.enum';
import { isStellarAccountActive } from 'src/shares/helpers/stellar-check-address';
import { Network } from 'src/shares/enums/network';
import { UserLockStatus, UserStatus } from 'src/modules/users/enums/user-status.enum';
import { WalletService } from 'src/modules/wallets/wallet.service';
import { ONE_DAY, ONE_HOUR_IN_MINUTE, ONE_MONTH, ONE_YEAR } from 'src/shares/constants/constant';
import { BAD_REQUEST, FORBIDDEN } from 'src/shares/constants/httpExceptionSubCode.constant';
import { genRandomSixDigit } from 'src/shares/helpers/utils';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { Connection, UpdateResult } from 'typeorm';
import { PoolPnlRepository } from 'src/models/repositories/pool_pnl.repository';
import { PoolPnlEntity } from 'src/models/entities/pool_pnl.entity';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const moment = require('moment');

const verifyEmailTokenConfig = {
  expiresIn: jwtConstants.verifyEmailTokenExpiry,
  secret: jwtConstants.verifyEmailTokenSecret,
};

@Injectable()
export class UsersService {
  private ACTIVE_TOKEN_TTL = 60 * 15;
  private EXPIRE_RESET_PASS_TOKEN_SECONDS = 60 * 30;

  constructor(
    private walletService: WalletService,
    @InjectRepository(User, 'master')
    private usersRepository: UserRepository,
    @InjectRepository(User, 'report')
    private usersRepositoryReport: UserRepository,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
    @InjectConnection('master')
    private connection: Connection,
    private jwtService: JwtService,
    @InjectRepository(PnlRepository, 'report')
    public readonly pnlRepoReport: PnlRepository,
    @InjectRepository(PoolPnlRepository, 'report')
    private poolPnlRepoReport: PoolPnlRepository,
    @InjectRepository(ConfigIntervalRepository, 'report')
    public readonly configIntervalRepoReport: ConfigIntervalRepository,
    @InjectRepository(ConfigIntervalRepository, 'master')
    public readonly configIntervalRepoMaster: ConfigIntervalRepository,
    @InjectRepository(IntervalSettingRepository, 'report')
    public readonly intervalSettingRepoReport: IntervalSettingRepository,
    @InjectRepository(IntervalSettingRepository, 'master')
    public readonly intervalSettingRepoMaster: IntervalSettingRepository,
    @InjectRepository(HistoryLogRepository, 'report')
    public readonly historyRepoReport: HistoryLogRepository,
    @InjectRepository(HistoryLogRepository, 'master')
    public readonly historyRepoMaster: HistoryLogRepository,
    private readonly mailService: MailService,
  ) {}

  async findOne(id: { id: string | number }): Promise<User> {
    // const rs = await this.usersRepositoryReport.findOne(id);
    const rs = await this.usersRepositoryReport
      .createQueryBuilder('users')
      .select('*')
      .where('users.id = :id', id)
      .getRawOne();
    if (!rs) {
      throw new HttpException({ key: 'user.NOT_EXISTS' }, HttpStatus.BAD_REQUEST);
    }

    return {
      ...rs,
      locked: rs.is_locked,
    };
  }

  findUserByEmail(email: string): Promise<User> {
    return this.usersRepositoryReport.findOne({
      where: {
        email: email,
      },
    });
  }

  async findUserByEmailOptions(options: {
    status?: UserStatus;
    email: string;
    is_locked?: UserLockStatus;
  }): Promise<User> {
    if (!options.status) options.status = UserStatus.Active;
    if (!options.is_locked) options.is_locked = UserLockStatus.Unlocked;

    const user = await this.usersRepositoryReport.findOne({
      where: {
        email: options.email,
      },
    });

    if (!user) {
      throw new HttpException({ key: 'user.NOT_EXISTS', code: FORBIDDEN.WRONG_EMAIL }, HttpStatus.FORBIDDEN);
    }

    if (user.status === options.status && user.locked === options.is_locked) return user;

    // Not as expected stats
    if (options.status === UserStatus.Submit) {
      throw new HttpException({ key: 'user.USER_EMAIL_VERIFIED' }, HttpStatus.NOT_ACCEPTABLE);
    }

    //
    if (user.status === UserStatus.Deactive) {
      throw new ForbiddenException();
    }

    if (user.status === UserStatus.Submit) {
      throw new HttpException(
        { key: 'user.USER_EMAIL_NOT_VERIFIED', code: FORBIDDEN.USER_EMAIL_NOT_VERIFIED },
        HttpStatus.FORBIDDEN,
      );
    }

    if (user.status === UserStatus.PendingActive) {
      throw new HttpException({ key: 'user.USER_NOT_ACTIVE', code: FORBIDDEN.USER_NOT_ACTIVE }, HttpStatus.FORBIDDEN);
    }

    //
    if (user.locked == UserLockStatus.Locked) {
      throw new HttpException({ key: 'user.USER_DEACTIVE', code: FORBIDDEN.USER_DEACTIVE }, HttpStatus.FORBIDDEN);
    }
  }

  async remove(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  create(userDto: CreateUserDto): Promise<User> {
    // in transaction
    const userEntity = plainToClass(User, userDto);
    userEntity.status = UserStatus.PendingActive;
    const user = this.usersRepository.create(userEntity);
    return this.usersRepository.save(user);
  }

  async changeUserStatus(userIds: number[], status: number): Promise<UpdateResult> {
    return this.usersRepository
      .createQueryBuilder('users')
      .update(User)
      .set({ status: status })
      .whereInIds({ id: userIds })
      .execute();
  }

  async changeUserType(userIds: number[], type: number): Promise<UpdateResult> {
    return this.usersRepository
      .createQueryBuilder('users')
      .update(User)
      .set({ user_type: type })
      .whereInIds({ id: userIds })
      .execute();
  }

  async generateActiveToken(userId: number): Promise<string> {
    const payload = { userId };
    const token = await hash(JSON.stringify(payload), 1);
    // save to redis
    await this.cacheService.set(token.toString(), payload, { ttl: this.ACTIVE_TOKEN_TTL });
    return token;
  }

  async generateResetPasswordToken(email: string): Promise<number> {
    const token = genRandomSixDigit();
    const user = await this.findUserByEmailOptions({ email });

    user.token_reset_password = token;
    user.expire = new Date();
    user.expire.setSeconds(user.expire.getSeconds() + this.EXPIRE_RESET_PASS_TOKEN_SECONDS);

    await this.usersRepository.save({
      id: user.id,
      expire: user.expire,
      token_reset_password: user.token_reset_password,
    });
    return token;
  }

  async checkPassToken(email: string, token: string): Promise<boolean> {
    const user = await this.findUserByEmailOptions({ email });

    const isExpired = user.expire.getTime() < new Date().getTime();

    return !isExpired && Number(token) === Number(user.token_reset_password);
  }

  async updatePassword(email: string, password: string): Promise<boolean> {
    try {
      const user = await this.findUserByEmailOptions({ email });

      const samePass = await bcrypt.compare(password, user.password);

      if (samePass) {
        throw new HttpException(
          { key: 'user.SAME_PREVIOUS_PASSWORD', code: BAD_REQUEST.SAME_PREVIOUS_PASSWORD },
          HttpStatus.BAD_REQUEST,
        );
      }

      user.password = await bcrypt.hash(password, jwtConstants.saltRound);
      user.token_reset_password = null;
      await this.usersRepository.save(user);
    } catch (err) {
      if (err.status === 400) throw err;
      return false;
    }
    return true;
  }

  async setFirstLogin(id: number, is_first_login: boolean): Promise<void> {
    await this.usersRepository.update(id, {
      is_first_login,
    });
  }

  async changePassword(changePassDto: ChangePassDto, userId: number): Promise<boolean> {
    const user = await this.findOne({ id: userId });
    const correctPass = await bcrypt.compare(changePassDto.currentPassword, user.password);
    if (!correctPass) {
      throw new HttpException({ key: 'user.INVALID_PASSWORD' }, HttpStatus.NOT_ACCEPTABLE);
    }

    user.password = await bcrypt.hash(changePassDto.newPassword, jwtConstants.saltRound);
    user.token_reset_password = null;
    await this.usersRepository.save(user);

    return true;
  }
  async findUserById(id: number): Promise<User> {
    return this.usersRepositoryReport.findOne(id);
  }

  async getProfile(req, userId: number): Promise<unknown> {
    const user = await this.findUserById(userId);
    const listUserFunCurrencies = await this.usersRepositoryReport.getListUserFunCurrencies(user.id);
    const ip = req.connection.remoteAddress;
    const last_login = await this.usersRepositoryReport.getLastLogin(user.id);

    const accessTokenPayload = { sub: user.id };

    return {
      access_token: this.jwtService.sign(accessTokenPayload),
      refresh_token: user.refresh_token,
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
  }

  async createUser(userDto: CreateUserDto): Promise<void> {
    await this.connection.transaction(async (manager) => {
      // VALIDATE WALLET ADDRESS
      for (const address of userDto.wallets) {
        const walletNetwork = await this.walletService.checkWalletAddressNetwork(address);

        const isExists = await this.walletService.isWalletAddressExist(address);
        if (isExists) {
          throw new HttpException({ key: 'user-wallet.ADDRESS_EXISTS' }, HttpStatus.BAD_REQUEST);
        }

        if (walletNetwork === Network.Stellar) {
          const isActive = await isStellarAccountActive(address);
          if (!isActive) {
            throw new HttpException({ key: 'user-wallet.ADDRESS_NOT_ACTIVE' }, HttpStatus.BAD_REQUEST);
          }

          const isTrustline = await this.walletService.checkWalletAddressTrustline(address);
          if (!isTrustline) {
            throw new HttpException({ key: 'user-wallet.ADDRESS_NOT_TRUSTLINE' }, HttpStatus.BAD_REQUEST);
          }
        }
      }

      const userEntity = plainToClass(User, userDto, { excludeExtraneousValues: true });
      userEntity.status = UserStatus.Submit;
      userEntity.role = Role.User;
      userEntity.is_first_login = false;
      const user = await manager.save(User, userEntity);

      const listUserWallet = userDto.wallets.map((val) => {
        return {
          user_id: user.id,
          address: val,
        };
      });

      const listUserFunCurrencies = userDto.functional_currencies.map((val, idx) => {
        const funCur = {
          user_id: user.id,
          currency_id: val,
          active: FuntionalCurrenciesStatus.active,
        };
        if (idx === 0) {
          funCur.active = FuntionalCurrenciesStatus.primary;
        }
        return funCur;
      });
      await Promise.all([
        manager.save(UserWallet, listUserWallet),
        manager.save(FunctionalCurrencyUsers, listUserFunCurrencies),
      ]);
    });
  }
  async unlock(userId: number): Promise<boolean> {
    const user = await this.usersRepositoryReport.findOne({
      select: ['locked'],
      where: {
        id: userId,
      },
    });
    if (user.locked == UserLockStatus.Unlocked) return true;

    try {
      await this.usersRepository
        .createQueryBuilder()
        .update()
        .set({ locked: UserLockStatus.Unlocked })
        .where('id = :id', { id: userId })
        .execute();
    } catch {
      return false;
    }

    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async decodeJWTVerifyToken(token: string): Promise<any> {
    let verifyEmailTokenDecode;
    try {
      verifyEmailTokenDecode = await this.jwtService.verify(token, verifyEmailTokenConfig);
    } catch (e) {
      if (e.name === 'TokenExpiredError') {
        throw new HttpException(
          { key: 'user.EMAIL_VERIFY_EXPIRE', code: FORBIDDEN.EMAIL_VERIFY_EXPIRE },
          HttpStatus.FORBIDDEN,
        );
      } else {
        throw new HttpException(
          { key: 'user.INVALID_TOKEN', code: FORBIDDEN.EMAIL_VERIFY_FAILD },
          HttpStatus.FORBIDDEN,
        );
      }
    }

    return verifyEmailTokenDecode;
  }

  async getVerifyEmailToken(email: string): Promise<string> {
    const user = await this.findUserByEmailOptions({ status: UserStatus.Submit, email });

    const payload = { sub: user.id };
    return this.jwtService.sign(payload, verifyEmailTokenConfig);
  }

  async lock(userId: number): Promise<boolean> {
    const user = await this.usersRepositoryReport.findOne(userId);
    if (user.locked == UserLockStatus.Locked) return true;

    try {
      await this.usersRepository
        .createQueryBuilder()
        .update()
        .set({ locked: UserLockStatus.Locked })
        .where('id = :id', { id: userId })
        .execute();
    } catch {
      return false;
    }

    return true;
  }

  async setRefreshToken(refreshToken: string, userId: number): Promise<void> {
    const refresh_token = await bcrypt.hash(refreshToken, jwtConstants.saltRound);
    await this.usersRepository.update(userId, {
      refresh_token,
    });
  }

  async getUserIfRefreshTokenMatch(refreshToken: string, userId: number): Promise<User> {
    const user = await this.usersRepositoryReport.findOne({
      select: ['id', 'refresh_token'],
      where: {
        id: userId,
      },
    });

    if (!user) throw new HttpException({ key: 'user.NOT_EXISTS' }, HttpStatus.NOT_FOUND);

    const isRefreshTokenMatching = await bcrypt.compare(refreshToken, user.refresh_token);

    if (!isRefreshTokenMatching)
      throw new HttpException({ key: 'user.REFRESH_TOKEN_INVALID' }, HttpStatus.UNAUTHORIZED);

    return user;
  }

  async removeRefreshToken(userId: number): Promise<User> {
    await this.usersRepository.update(userId, {
      refresh_token: null,
    });
    return this.findOne({ id: userId });
  }

  async updatelistUserFunCurrencies(userDto: UpdateUserDto): Promise<void> {
    await this.connection.transaction(async (manager) => {
      await this.usersRepository.deleteLastlistUserFunCurrencies(userDto.userId);
      const listUserFunCurrencies = userDto.functional_currencies.map((val, idx) => {
        const funCur = {
          user_id: userDto.userId,
          currency_id: val,
          active: FuntionalCurrenciesStatus.active,
        };
        if (idx === 0) {
          funCur.active = FuntionalCurrenciesStatus.primary;
        }
        return funCur;
      });
      await Promise.all([manager.save(FunctionalCurrencyUsers, listUserFunCurrencies)]);
    });
  }

  // get all users by admin
  async findAll({
    page,
    limit,
    ...optionals
  }: PaginationInput & SearchUserByAdminDto): Promise<Response<Partial<User[]>>> {
    const { user_type, status, user_id, email, user_registration, user_role, created_at } = optionals;
    const qb = this.usersRepositoryReport
      .createQueryBuilder()
      .select([
        'id',
        'title',
        'email',
        'company',
        'fullname',
        'role',
        'user_type',
        'phone',
        'velo_account',
        'token_reset_password',
        'expire',
        'is_locked',
        'refresh_token',
        'status',
        'position',
        'created_at',
        'updated_at',
      ]);

    if (status || status === 0) {
      qb.andWhere(`is_locked = :status`, { status });
    }
    if (user_type || user_type === 0) {
      qb.andWhere(`user_type = :user_type`, { user_type });
    }
    if (user_registration || user_registration === 0) {
      qb.andWhere(`status = :user_registration`, { user_registration });
    }
    if (user_role || user_role === 0) {
      qb.andWhere(`role = :user_role`, { user_role });
    }
    if (user_id) {
      qb.andWhere(`id like :user_id`, { user_id: `%${user_id}%` });
    }
    if (email) {
      qb.andWhere(`email like :email`, { email: `%${email}%` });
    }

    const [rs, total] = await Promise.all([
      qb
        .orderBy('created_at', created_at)
        .limit(limit)
        .offset((page - 1) * limit)
        .getRawMany(),
      qb.getCount(),
    ]);
    return {
      data: rs,
      metadata: {
        page,
        limit,
        totalItem: total,
        totalPage: Math.ceil(total / limit),
      },
    };
  }

  async checkUserId(usersId: number[]): Promise<User[]> {
    const rs = await this.usersRepository.findByIds(usersId);
    if (rs.length !== usersId.length) {
      throw new HttpException({ key: 'user.NOT_EXISTS' }, HttpStatus.BAD_REQUEST);
    }
    return rs;
  }

  // update user type by admin
  async updateUserType({
    usersId,
    user_type,
    adminEmail,
  }: {
    usersId: number[];
    user_type: number;
    adminEmail: string;
  }): Promise<Partial<User[]>> {
    const users = await this.checkUserId(usersId);
    const admin = await this.usersRepository.findOne({ email: adminEmail });
    // write to history log
    const historyLogList = [];
    users.forEach((user: User) => {
      const historyEntity = new HistoryLogEntity();
      historyEntity.activities = `${adminEmail} has change user type from ${user.user_type} to ${user_type} of ${user.id}`;
      historyEntity.admin_id = admin.id;
      historyEntity.activity_type = ActivityType.ManageUser;
      historyLogList.push(historyEntity);
    });
    this.historyRepoReport.save(historyLogList);
    await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({ user_type })
      .where('users.id IN (:...usersId)', { usersId })
      .execute();
    return this.checkUserId(usersId);
  }

  // update user status by admin
  async updateUserStatus({ usersId, is_locked }: { usersId: number[]; is_locked: number }): Promise<Partial<User[]>> {
    const users = await this.checkUserId(usersId);
    const mail_support = getConfig().get<string>('mail.from');
    const clientUrl = getConfig().get<string>('fcx.page');
    users.forEach((user) => {
      if (is_locked === UserLockStatus.Locked && user.locked === UserLockStatus.Unlocked) {
        this.mailService.sendMailDisableAccount(user.email, mail_support);
      }
      if (is_locked === UserLockStatus.Unlocked && user.locked === UserLockStatus.Locked) {
        this.mailService.sendMailEnableAccount(user.email, `${clientUrl}/sign-in`);
      }
    });
    await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({ locked: is_locked })
      .where('users.id IN (:...usersId)', { usersId })
      .execute();
    return this.checkUserId(usersId);
  }

  // update status user registration
  async updateStatusUserRegistration({
    usersId,
    status,
  }: {
    usersId: number[];
    status: number;
  }): Promise<Partial<User[]>> {
    await this.checkUserId(usersId);
    await this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({ status })
      .where('users.id IN (:...usersId)', { usersId })
      .execute();
    return this.checkUserId(usersId);
  }

  async getPnls(userId: number, from: number, to: number, wallet = null): Promise<PnlEntity[]> {
    const fromDate = new moment(new Date(from)).format('YYYY-MM-DD');
    const toDate = new moment(new Date(to)).format('YYYY-MM-DD');
    return this.pnlRepoReport.getDataForUserByRangeDate(fromDate, toDate, userId, wallet);
  }

  async getPoolPnls(userId: number, from: number, to: number, wallet = null): Promise<PoolPnlEntity[]> {
    const fromDate = new moment(new Date(from)).format('YYYY-MM-DD');
    const toDate = new moment(new Date(to)).format('YYYY-MM-DD');
    return this.poolPnlRepoReport.getDataForUserByRangeDate(fromDate, toDate, userId, wallet);
  }

  // super admin create admin
  async createAdmin(userAdmin: CreateAdminDto, defaultPassword: string): Promise<Partial<User>> {
    // VALIDATE WALLET ADDRESS
    for (const address of userAdmin.wallets) {
      const walletNetwork = await this.walletService.checkWalletAddressNetwork(address);

      const isExists = await this.walletService.isWalletAddressExist(address);
      if (isExists) {
        throw new HttpException({ key: 'user-wallet.ADDRESS_EXISTS' }, HttpStatus.BAD_REQUEST);
      }

      if (walletNetwork === Network.Stellar) {
        const isActive = await isStellarAccountActive(address);
        if (!isActive) {
          throw new HttpException({ key: 'user-wallet.ADDRESS_NOT_ACTIVE' }, HttpStatus.BAD_REQUEST);
        }

        const isTrustline = await this.walletService.checkWalletAddressTrustline(address);
        if (!isTrustline) {
          throw new HttpException({ key: 'user-wallet.ADDRESS_NOT_TRUSTLINE' }, HttpStatus.BAD_REQUEST);
        }
      }
    }

    await this.connection.transaction(async (manager) => {
      const userEntity = plainToClass(User, userAdmin, { excludeExtraneousValues: true });

      userEntity.status = UserStatus.Active;
      userEntity.role = Role.Admin;
      userEntity.password = defaultPassword;
      userEntity.is_first_login = true;
      const user = await manager.save(User, userEntity);

      const listUserWallet = userAdmin.wallets.map((val) => {
        return {
          userId: user.id,
          address: val,
        };
      });

      const listUserFunCurrencies = userAdmin.functional_currencies.map((val, idx) => {
        const funCur = {
          user_id: user.id,
          currency_id: val,
          active: FuntionalCurrenciesStatus.active,
        };
        if (idx === 0) {
          funCur.active = FuntionalCurrenciesStatus.primary;
        }
        return funCur;
      });

      await Promise.all([
        manager.save(UserWallet, listUserWallet),
        manager.save(FunctionalCurrencyUsers, listUserFunCurrencies),
      ]);
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rs } = await this.findUserByEmail(userAdmin.email);
    return rs;
  }

  async getVolatilityByUser(userId: number): Promise<{ interval: number; annualized: string }> {
    const ownVolatility = await this.configIntervalRepoReport.getVolatilityByUserId(userId);
    const interval = !ownVolatility ? DEFAULT_INTERVAL : ownVolatility.interval;
    const intervalSetting = await this.intervalSettingRepoReport.findOne(interval);
    return {
      interval,
      annualized: intervalSetting.annualized,
    };
  }

  async createOrUpdateVolatility(interval: number, userId: number): Promise<ConfigIntervalEntity> {
    if (!interval) {
      throw new HttpException(
        {
          key: 'config-interval.INVALID_CONFIG_VOLATILITY_USER',
          code: ConfigIntervalErrorStatus.InvalidConfigVolatilityUser,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const intervalSetting = await this.intervalSettingRepoReport.findOne(interval);
    if (!intervalSetting) {
      throw new HttpException(
        {
          key: 'config-interval.INVALID_CONFIG_VOLATILITY_USER',
          code: ConfigIntervalErrorStatus.InvalidConfigVolatilityUser,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const userVolatility = await this.configIntervalRepoReport.getVolatilityByUserId(userId);
    if (!userVolatility) {
      const newConfig = new ConfigIntervalEntity();
      newConfig.interval = intervalSetting.interval;
      newConfig.user_id = userId;
      newConfig.type = ConfigIntervalType.Volatility;
      return await this.configIntervalRepoMaster.save(newConfig);
    } else {
      userVolatility.interval = intervalSetting.interval;
      userVolatility.updated_at = new Date();
      return await this.configIntervalRepoMaster.save(userVolatility);
    }
  }

  async createOrUpdateConfidence(interval: number, userId: number): Promise<ConfigIntervalEntity> {
    if (interval <= 0) {
      throw new HttpException(
        {
          key: 'config-interval.INVALID_TIME',
          code: ConfigIntervalErrorStatus.InvalidTime,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const confidence = await this.configIntervalRepoReport.getConfidenceByUserId(userId);
    if (!confidence) {
      const newConfig = new ConfigIntervalEntity();
      newConfig.type = ConfigIntervalType.Confidence;
      newConfig.user_id = userId;
      newConfig.interval = interval;
      return await this.configIntervalRepoMaster.save(newConfig);
    } else {
      confidence.interval = interval;
      confidence.updated_at = new Date();
      return await this.configIntervalRepoMaster.save(confidence);
    }
  }

  async getConfidence(userId: number): Promise<{ interval: number; calculation: number }> {
    const configConfidence = await this.configIntervalRepoReport.getConfidenceByUserId(userId);
    const interval = !configConfidence ? DEFAULT_INTERVAL : configConfidence.interval;
    return {
      interval: interval,
      calculation: interval / CALCULATION_INTERVAL_CONFIDENCE,
    };
  }

  async getAllIntervalSettings(page: number, limit: number): Promise<Response<Partial<IntervalSettingsDto[]>>> {
    const intervalList = await this.intervalSettingRepoReport.getAllInterval(page, limit);
    const responseArr: IntervalSettingsDto[] = [];
    intervalList.data.sort((a: IntervalSettings, b: IntervalSettings) => a.interval - b.interval);
    intervalList.data.forEach((item) => {
      const intervalDto = new IntervalSettingsDto();
      intervalDto.interval = this.formatInterval(new BigNumber(item.interval).toNumber());
      intervalDto.by_the_interval = `${Number(item.by_the_interval).toFixed(6)}%`;
      intervalDto.annualized = `${Number(item.annualized).toFixed(2)}%`;
      intervalDto.intervalData = item.interval;
      return responseArr.push(intervalDto);
    });
    return {
      data: responseArr,
      metadata: intervalList.metadata,
    };
  }
  private formatInterval(interval: number): string {
    if (interval / ONE_HOUR_IN_MINUTE < 1) {
      return interval == 1 ? `${interval} minute` : `${interval} minutes`;
    } else {
      if (interval / ONE_DAY < 1) {
        return interval / ONE_HOUR_IN_MINUTE == 1
          ? `${interval / ONE_HOUR_IN_MINUTE} hour`
          : `${interval / ONE_HOUR_IN_MINUTE} hours`;
      }
      if (interval / ONE_MONTH < 1) {
        return interval / ONE_DAY == 1 ? `${interval / ONE_DAY} day` : `${interval / ONE_DAY} days`;
      }
      if (interval / ONE_YEAR < 1) {
        return interval / ONE_MONTH == 1 ? `${interval / ONE_MONTH} month` : `${interval / ONE_MONTH} months`;
      } else {
        return interval / ONE_YEAR == 1 ? `${interval / ONE_YEAR} year` : `${interval / ONE_YEAR} years`;
      }
    }
  }
}
