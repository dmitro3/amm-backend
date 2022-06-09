import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({
  name: 'notifications',
})
export class NotificationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  type: NotificationType;

  @Column()
  title: string;

  @Column()
  message: string;

  @Column()
  show_time: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  public static createNotification(
    userId: number,
    type: NotificationType,
    message: string,
    showTime: Date = undefined,
  ): NotificationEntity {
    let title;
    switch (type) {
      case NotificationType.Wallet:
        title = 'Wallet address whitelisting/Rejection';
        break;
      case NotificationType.OrderBookTradingFee:
        title = 'Order book trading fee changes';
        break;
      case NotificationType.Confidence:
        title = 'Confidence interval table change from Velo admin';
        break;
      case NotificationType.PoolRequest:
        title = 'Your pool request has been approved by Velo admin';
        break;
      case NotificationType.PoolSwapFee:
        title = 'The swap fee in your pool has been changed';
        break;
      default:
        throw Error('Invalid type notification');
    }
    const notification = new NotificationEntity();
    notification.user_id = userId;
    notification.type = type;
    notification.title = title;
    notification.message = message;
    notification.show_time = showTime;
    return notification;
  }
}

export enum NotificationType {
  OrderBookTradingFee = 'OrderBookTradingFee',
  PoolSwapFee = 'PoolSwapFee',
  PoolRequest = 'PoolRequest',
  Wallet = 'Wallet',
  Confidence = 'Confidence',
}

export enum TypeNotification {
  Unread = 0,
  Read = 1,
  System = 2,
  All = 3,
}
