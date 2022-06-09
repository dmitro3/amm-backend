import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { jwtConstants } from 'src/modules/auth/constants';
import { User } from 'src/models/entities/users.entity';
import { UserLockStatus } from 'src/modules/users/enums/user-status.enum';
import { FORBIDDEN } from 'src/shares/constants/httpExceptionSubCode.constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.accessTokenSecret,
    });
  }

  async validate({ sub: id }: { sub: string | number }): Promise<Partial<User>> {
    const user = await this.usersService.findOne({ id });
    if (!user) {
      throw new UnauthorizedException();
    }

    if (user.locked == UserLockStatus.Locked) {
      throw new HttpException({ key: 'user.USER_DEACTIVE', code: FORBIDDEN.USER_DEACTIVE }, HttpStatus.FORBIDDEN);
    }

    return user;
  }
}
