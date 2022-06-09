import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from 'src/modules/configs/config.service';
import { ConfigController } from 'src/modules/configs/config.controller';
import { ConfigRepository } from 'src/models/repositories/config.repository';

@Module({
  providers: [ConfigService],
  controllers: [ConfigController],
  imports: [TypeOrmModule.forFeature([ConfigRepository], 'master')],
})
export class ConfigModule {}
