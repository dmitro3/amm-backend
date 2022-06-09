import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'notification_status',
})
export class NotificationStatusEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  notification_id: number;

  @Column()
  is_read: NotificationReadStatus;

  @Column()
  is_show: NotificationShowStatus;

  @Column()
  is_trash: NotificationTrashStatus;
}

export enum NotificationReadStatus {
  NotRead = 0,
  Read = 1,
}

export enum NotificationShowStatus {
  Show = 1,
  NotShow = 0,
}

export enum NotificationTrashStatus {
  InTrash = 1,
  NotInTrash = 0,
}

export enum NotificationStatusTypeUpdate {
  Read = 0,
  Trash = 1,
  Hide = 2,
}
