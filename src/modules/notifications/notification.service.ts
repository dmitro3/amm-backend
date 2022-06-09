import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  NotificationReadStatus,
  NotificationShowStatus,
  NotificationStatusEntity,
  NotificationStatusTypeUpdate,
  NotificationTrashStatus,
} from 'src/models/entities/notification_status.entity';
import { NotificationRepository } from 'src/models/repositories/nofitication.respository';
import { NotificationStatusRepository } from 'src/models/repositories/nofitication_status.respository';
import { NotificationPoolSwapDto } from 'src/modules/notifications/dto/notification-pool-swap.dto';
import { NotificationsWithStatus } from 'src/modules/notifications/dto/notifications-with-status.dto';
import { SearchNotificationDto } from 'src/modules/notifications/dto/search-notification.dto';
import { DEFAULT_PAGE_QUERY, DEFAULT_SIZE_QUERY } from 'src/modules/notifications/notification.const';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { kafka } from 'src/configs/kafka';
import { KafkaTopic } from 'src/shares/enums/kafka';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationRepository, 'master')
    public readonly notificationRepoMaster: NotificationRepository,
    @InjectRepository(NotificationRepository, 'report')
    public readonly notificationRepoReport: NotificationRepository,
    @InjectRepository(NotificationStatusRepository, 'master')
    public readonly notificationStatusRepoMaster: NotificationStatusRepository,
    @InjectRepository(NotificationStatusRepository, 'report')
    public readonly notificationStatusRepoReport: NotificationStatusRepository,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(NotificationService.name);
  }

  async countNotificationNotRead(userId: number): Promise<number> {
    return await this.notificationRepoReport.countNotificationNotRead(userId);
  }

  async setNotificationsStatus(
    notificationIds: number[],
    userId: number,
    typeUpdate: NotificationStatusTypeUpdate,
  ): Promise<boolean> {
    const notifications = await this.notificationRepoReport.getOwnNotificationByIds(userId, notificationIds);
    if (notifications.length === 0) return true;

    const dataUpdate = [];
    for (const notification of notifications) {
      const newNotificationStatus = new NotificationStatusEntity();
      newNotificationStatus.notification_id = notification.id;
      newNotificationStatus.user_id = userId;
      if (Number(notification.n_status_id) > 0) {
        newNotificationStatus.id = Number(notification.n_status_id);
      } else {
        newNotificationStatus.is_read = NotificationReadStatus.NotRead;
        newNotificationStatus.is_trash = NotificationTrashStatus.NotInTrash;
        newNotificationStatus.is_show = NotificationShowStatus.Show;
      }

      switch (typeUpdate) {
        case NotificationStatusTypeUpdate.Read:
          if (notification.is_read === NotificationReadStatus.Read) continue;
          newNotificationStatus.is_read = NotificationReadStatus.Read;
          break;
        case NotificationStatusTypeUpdate.Trash:
          if (notification.is_trash === NotificationTrashStatus.InTrash) continue;
          newNotificationStatus.is_trash = NotificationTrashStatus.InTrash;
          break;
        case NotificationStatusTypeUpdate.Hide:
          if (notification.is_show === NotificationShowStatus.NotShow) continue;
          newNotificationStatus.is_show = NotificationShowStatus.NotShow;
          break;
        default:
          throw Error('No type update for notification status');
      }
      dataUpdate.push(newNotificationStatus);
    }
    if (dataUpdate === []) return false;
    await this.notificationStatusRepoMaster.save(dataUpdate);
    return true;
  }

  async getOwnNotifications(
    userId: number,
    params: SearchNotificationDto,
    page = DEFAULT_PAGE_QUERY,
    size = DEFAULT_SIZE_QUERY,
  ): Promise<Response<Partial<NotificationsWithStatus[]>>> {
    const countAllOwnNotifications = await this.notificationRepoReport.countAllOwnNotification(
      userId,
      params.is_read,
      params.is_trash,
      false,
    );
    const data = await this.notificationRepoReport.getNotificationByCondition(
      userId,
      params.is_read,
      params.is_trash,
      false,
      page,
      size,
    );
    return {
      data: data,
      metadata: {
        page: Number(page),
        limit: Number(size),
        totalItem: countAllOwnNotifications,
        totalPage: Math.ceil(countAllOwnNotifications / size),
      },
    };
  }

  async getSystemNotification(
    userId: number,
    params: SearchNotificationDto,
    page = DEFAULT_PAGE_QUERY,
    size = DEFAULT_SIZE_QUERY,
  ): Promise<Response<Partial<NotificationsWithStatus[]>>> {
    const data = await this.notificationRepoReport.getNotificationByCondition(
      userId,
      params.is_read,
      params.is_trash,
      true,
      page,
      size,
    );
    const countAllSystemNotifications = await this.notificationRepoReport.countAllSystemNotification(userId);
    return {
      data: data,
      metadata: {
        page: Number(page),
        limit: Number(size),
        totalItem: countAllSystemNotifications,
        totalPage: Math.ceil(countAllSystemNotifications / size),
      },
    };
  }

  async createPoolSwapNotification(notificationPoolSwapDto: NotificationPoolSwapDto): Promise<boolean> {
    this.logger.log(`Create pool swap notification: ${JSON.stringify(notificationPoolSwapDto)}`);
    const producer = kafka.producer();
    await producer.connect();
    await producer.send({
      topic: KafkaTopic.PoolSwapFee,
      messages: [{ value: JSON.stringify(notificationPoolSwapDto) }],
    });
    return true;
  }
}
