import { MailerService } from '@nestjs-modules/mailer';
import * as config from 'config';
import { Command, Console } from 'nestjs-console';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/models/entities/users.entity';
import { UserRepository } from 'src/models/repositories/user.repository';
import { NotificationRepository } from 'src/models/repositories/nofitication.respository';
import { NotificationStatusRepository } from 'src/models/repositories/nofitication_status.respository';
import { UserSettingRepository } from 'src/models/repositories/user_setting.repository';
import { LatestBlockCoin, LatestBlockType } from 'src/modules/latest-block/latest-block.const';
import { LatestBlockService } from 'src/modules/latest-block/latest-block.service';
import { sleep } from 'src/shares/helpers/utils';
import { getConfig } from 'src/configs';
const mailFrom = config.get<number>('mail.from');
const FCX_PAGE = getConfig().get<string>('fcx.page');
import { NotificationEntity, NotificationType } from 'src/models/entities/notification.entity';
import { NotificationPoolSwapDto } from 'src/modules/notifications/dto/notification-pool-swap.dto';
import { querySubGraph } from 'src/shares/helpers/subgraph';
import { PoolSwapSubGapResponse } from 'src/modules/notifications/dto/pool-subgap.dto';
import { WalletRepository } from 'src/models/repositories/wallet.respository';
import { MAX_NOTIFICATION_SAVE } from 'src/modules/notifications/notification.const';
import { subscribeKafka } from 'src/shares/helpers/kafka';
import { KafkaGroup, KafkaTopic } from 'src/shares/enums/kafka';

@Console()
@Injectable()
export class NotificationConsole {
  constructor(
    @InjectRepository(User, 'report')
    private usersRepoReport: UserRepository,
    @InjectRepository(NotificationRepository, 'report')
    public readonly notificationRepoReport: NotificationRepository,
    @InjectRepository(NotificationRepository, 'master')
    public readonly notificationRepoMaster: NotificationRepository,

    @InjectRepository(WalletRepository, 'report')
    public readonly walletRepoReport: WalletRepository,

    @InjectRepository(NotificationStatusRepository, 'report')
    public readonly notificationStatusRepoReport: NotificationStatusRepository,
    @InjectRepository(UserSettingRepository, 'report')
    public readonly userSettingRepoReport: UserSettingRepository,
    private readonly latestBlockService: LatestBlockService,
    private mailerService: MailerService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(NotificationConsole.name);
  }

  @Command({
    command: 'send-mail <email> <subject> <body>',
    description: 'Get exchange rate of currencies from fixer',
  })
  async sendMail(email: string, subject: string, body: string): Promise<void> {
    await this.mailerService.sendMail({
      from: `"No Reply" <${mailFrom}>`,
      to: email,
      subject: subject,
      template: 'src/modules/mail/templates/notification.hbs',
      context: {
        title: subject,
        message: body,
        publicLink: FCX_PAGE,
      },
    });
  }

  @Command({
    command: 'mail-normal-notifications',
    description: 'Update users balance',
  })
  async mailUserNormalNotifications(): Promise<void> {
    while (true) {
      const latestBlock = await this.latestBlockService.getLatestBlock(
        LatestBlockCoin.None,
        LatestBlockType.NormalMailNotification,
      );

      const normalNotifications = await this.notificationRepoReport.getNotificationsFromId(latestBlock?.block || '0');

      if (normalNotifications.length === 0) {
        this.logger.log('No new notification. Waiting for next');
        await sleep(10000);
        continue;
      }

      for (const notification of normalNotifications) {
        const userSetting = await this.userSettingRepoReport.getUserEnableNotificationByUserId(notification.user_id);
        if (!userSetting) continue;

        await this.mailerService.sendMail({
          to: userSetting.email,
          subject: notification.title,
          template: 'src/modules/mail/templates/notification.hbs',
          context: {
            title: notification.title,
            message: notification.message,
            publicLink: FCX_PAGE,
          },
        });

        latestBlock.block = `${notification.id}`;
        await this.latestBlockService.saveLatestBlock(
          LatestBlockCoin.None,
          LatestBlockType.NormalMailNotification,
          `${notification.user_id}`,
        );
      }

      await sleep(10000);
    }
  }

  @Command({
    command: 'mail-system-notifications',
    description: 'Update users balance',
  })
  async mailUserSystemNotifications(): Promise<void> {
    while (true) {
      const latestBlock = await this.latestBlockService.getLatestBlock(
        LatestBlockCoin.None,
        LatestBlockType.SystemMailNotification,
      );

      const systemNotifications = await this.notificationRepoReport.getNotificationsFromId(
        latestBlock?.block || '0',
        true,
      );

      if (systemNotifications.length === 0) {
        this.logger.log('No system notification. Waiting for next');
        await sleep(10000);
        continue;
      }

      for (const notification of systemNotifications) {
        const keyLatestBlockByNotification = `${LatestBlockType.SystemMailNotification}_${notification.id}`;

        while (true) {
          const latestBlockByNotification = await this.latestBlockService.getLatestBlock(
            LatestBlockCoin.None,
            keyLatestBlockByNotification,
          );

          const userSetting = await this.userSettingRepoReport.getUserEnableNotificationFromId(
            latestBlockByNotification?.block || '0',
          );

          if (!userSetting) break;

          await this.mailerService.sendMail({
            to: userSetting.email,
            subject: notification.title,
            template: 'src/modules/mail/templates/notification.hbs',
            context: {
              title: notification.title,
              message: notification.message,
              publicLink: FCX_PAGE,
            },
          });

          await this.latestBlockService.saveLatestBlock(
            LatestBlockCoin.None,
            keyLatestBlockByNotification,
            `${userSetting.setting_id}`,
          );
        }

        await this.latestBlockService.saveLatestBlock(
          LatestBlockCoin.None,
          LatestBlockType.SystemMailNotification,
          `${notification.id}`,
        );
      }

      await sleep(10000);
    }
  }

  @Command({
    command: 'send-pool-swap-notifications',
    description: 'Update users balance',
  })
  async sendPoolSwapNotifications(): Promise<void> {
    const consumer = await subscribeKafka(KafkaGroup.PoolSwapFee, KafkaTopic.PoolSwapFee);
    await consumer.run({
      eachMessage: async ({ message }) => {
        this.logger.log(`Got create pool swap notification: ${message.value.toString()}`);
        const data: NotificationPoolSwapDto = JSON.parse(message.value.toString());
        await this.sendPoolSwapNotification(data);
      },
    });
    return new Promise(() => {});
  }

  async getUserBelongToPool(poolId: string): Promise<Response> {
    const query = {
      query: `
      {
        pools(where: {id: "${poolId}"}) {
          shares {
            userAddress {id}
            balance
          }
        }
      }
    `,
    };
    return await querySubGraph(query);
  }

  async sendPoolSwapNotification(notificationPoolSwapDto: NotificationPoolSwapDto): Promise<void> {
    const response = await this.getUserBelongToPool(notificationPoolSwapDto.poolId);
    const data = await response.json();
    const poolShares: [] = data?.data?.pools[0]?.shares || [];
    if (poolShares === []) return;

    while (poolShares.length > 0) {
      const shares: PoolSwapSubGapResponse[] = poolShares.splice(0, MAX_NOTIFICATION_SAVE);
      const userAddresses = shares.map((share) => share.userAddress.id);
      const usersWallets = await this.walletRepoReport.findAllWalletByAddress(userAddresses);

      if (usersWallets.length === 0) continue;

      const userIds = Array.from(new Set(usersWallets.map((userWallet) => userWallet.user_id)));
      const dataSave = [];

      for (const userId of userIds) {
        const notification = NotificationEntity.createNotification(
          userId,
          NotificationType.PoolSwapFee,
          `The swap fee in your pool has been changed from
          ${notificationPoolSwapDto.oldValue} to ${notificationPoolSwapDto.newValue}`,
        );
        dataSave.push(notification);
      }

      await this.notificationRepoMaster.save(dataSave);
    }
  }
}
