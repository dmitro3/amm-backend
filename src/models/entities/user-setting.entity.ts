import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({
  name: 'user_setting',
})
export class UserSettingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  key: UserSettingKey;

  @Column()
  value: string;
}

export enum UserSettingKey {
  IsMailNotificationEnable = 'IsMailNotificationEnable',
}
