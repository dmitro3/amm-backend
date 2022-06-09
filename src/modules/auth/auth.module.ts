import { CacheModule, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/modules/users/users.module';
import { jwtConstants } from 'src/modules/auth/constants';
import { AuthService } from 'src/modules/auth/auth.service';
import { LocalStrategy } from 'src/modules/auth/strategies/local.strategy';
import { JwtStrategy } from 'src/modules/auth/strategies/jwt.strategy';
import { AuthController } from 'src/modules/auth/auth.controller';
import { redisConfig } from 'src/configs/redis.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginHistories } from 'src/models/entities/login-histories.entity';
import { UserRepository } from 'src/models/repositories/user.repository';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.accessTokenSecret,
      signOptions: { expiresIn: jwtConstants.accessTokenExpiry },
    }),
    CacheModule.registerAsync({
      useFactory: () => redisConfig,
    }),
    TypeOrmModule.forFeature([LoginHistories], 'master'),
    TypeOrmModule.forFeature([UserRepository], 'master'),
    TypeOrmModule.forFeature([UserRepository], 'report'),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
