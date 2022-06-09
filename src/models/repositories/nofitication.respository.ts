// eslint-disable-next-line @typescript-eslint/no-var-requires
const moment = require('moment');
import { EntityRepository, MoreThan, Not, Repository } from 'typeorm';
import { NotificationEntity } from 'src/models/entities/notification.entity';
import { DEFAULT_PAGE_QUERY, DEFAULT_SIZE_QUERY } from 'src/modules/notifications/notification.const';
import {
  NotificationReadStatus,
  NotificationShowStatus,
  NotificationTrashStatus,
} from 'src/models/entities/notification_status.entity';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { NotificationsWithStatus } from 'src/modules/notifications/dto/notifications-with-status.dto';

@EntityRepository(NotificationEntity)
export class NotificationRepository extends Repository<NotificationEntity> {
  private baseColumnSelect = [
    'notifications.id as id',
    'ifnull(notification_status.id, 0) as n_status_id',
    'notifications.user_id as user_id',
    'type',
    'title',
    'message',
    'ifnull(is_trash, 0) as is_trash',
    'created_at',
    'updated_at',
    'ifnull(is_read, 0) as is_read',
    'ifnull(is_show, 1) as is_show',
  ];
  // todo: Notification of user id and not in trash join with notification status
  async getBaseQuery(
    userId: number,
    isRead: string,
    isTrash: string,
    systemNotificationOnly: boolean,
  ): Promise<SelectQueryBuilder<NotificationEntity>> {
    const qr = this.createQueryBuilder('notifications')
      .leftJoin(
        'notification_status',
        'notification_status',
        'notification_status.notification_id = notifications.id AND ' +
          `( notification_status.user_id = notifications.user_id OR notification_status.user_id=${userId})`,
      )
      .where(`notifications.user_id IN (${userId}, -1)`).andWhere(`(
        notification_status.is_trash = ${NotificationTrashStatus.NotInTrash} OR
        notification_status.is_trash IS NULL
      )`);

    if (isRead) {
      if (Number(isRead)) {
        qr.andWhere(`notification_status.is_read = ${NotificationReadStatus.Read}`);
      } else {
        qr.andWhere(`(
          notification_status.is_read = ${NotificationReadStatus.NotRead} OR
          notification_status.is_read IS NULL      
        )`);
      }
    }
    if (isTrash) {
      if (Number(isTrash)) {
        qr.andWhere(`notification_status.is_trash = ${NotificationTrashStatus.InTrash}`);
      } else {
        qr.andWhere(`(
          notification_status.is_read = ${NotificationTrashStatus.NotInTrash} OR
          notification_status.is_read IS NULL      
        )`);
      }
    }
    if (systemNotificationOnly) {
      const now = new moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      qr.andWhere(
        `(
            notification_status.is_show = ${NotificationShowStatus.Show} OR
            notification_status.is_show IS NULL      
          )`,
      ).andWhere(`notifications.show_time >= "${now}"`);
    }

    return qr;
  }

  async getNotificationByCondition(
    userId: number,
    isRead: string,
    isTrash: string,
    systemNotificationOnly: boolean,
    page = DEFAULT_PAGE_QUERY,
    size = DEFAULT_SIZE_QUERY,
  ): Promise<NotificationsWithStatus[]> {
    const qr = await this.getBaseQuery(userId, isRead, isTrash, systemNotificationOnly);
    return qr
      .offset((page - 1) * size)
      .limit(size)
      .orderBy('notifications.id', 'DESC')
      .select(this.baseColumnSelect)
      .getRawMany();
  }

  async getOwnNotificationByIds(userId: number, ids = undefined): Promise<NotificationsWithStatus[]> {
    const qr = await this.getBaseQuery(userId, undefined, undefined, false);

    if (ids) qr.andWhere('notifications.id IN (:ids)', { ids: ids });
    return qr.select(this.baseColumnSelect).getRawMany();
  }

  async countNotificationNotRead(userId: number): Promise<number> {
    const qr = await this.getBaseQuery(userId, '0', '0', false);
    return qr
      .andWhere(
        `(
          notification_status.is_read = ${NotificationReadStatus.NotRead} OR
          notification_status.is_read IS NULL      
        )`,
      )
      .getCount();
  }

  async countAllOwnNotification(
    userId: number,
    isRead: string,
    isTrash: string,
    systemNotificationOnly: boolean,
  ): Promise<number> {
    const qr = await this.getBaseQuery(userId, isRead, isTrash, systemNotificationOnly);
    return qr.getCount();
  }

  async countAllSystemNotification(userId: number): Promise<number> {
    const qr = await this.getBaseQuery(userId, undefined, undefined, true);
    return qr.getCount();
  }

  async getNotificationsFromId(notificationId: string, isSystem = false): Promise<NotificationEntity[]> {
    return await this.find({
      where: {
        id: MoreThan(notificationId),
        user_id: isSystem ? -1 : Not(-1),
      },
    });
  }
}
