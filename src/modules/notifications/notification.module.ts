import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from 'src/modules/notifications/notification.service';
import { NotificationController } from 'src/modules/notifications/notification.controller';
import { NotificationRepository } from 'src/models/repositories/nofitication.respository';
import { NotificationStatusRepository } from 'src/models/repositories/nofitication_status.respository';
import { NotificationConsole } from 'src/modules/notifications/notification.console';
import { LatestBlockService } from 'src/modules/latest-block/latest-block.service';
import { LatestBlockRepository } from 'src/models/repositories/latest-block.repository';
import { UserRepository } from 'src/models/repositories/user.repository';
import { UserSettingRepository } from 'src/models/repositories/user_setting.repository';
import { WalletRepository } from 'src/models/repositories/wallet.respository';

@Module({
  providers: [NotificationService, Logger, NotificationConsole, LatestBlockService],
  controllers: [NotificationController],
  exports: [NotificationService],
  imports: [
    TypeOrmModule.forFeature(
      [NotificationRepository, NotificationStatusRepository, LatestBlockRepository, UserRepository],
      'master',
    ),
    TypeOrmModule.forFeature(
      [NotificationRepository, NotificationStatusRepository, UserRepository, UserSettingRepository, WalletRepository],
      'report',
    ),
  ],
})
export class NotificationModule {}
