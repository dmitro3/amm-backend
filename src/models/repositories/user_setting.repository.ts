import { EntityRepository, Repository } from 'typeorm';
import { UserSettingEntity, UserSettingKey } from 'src/models/entities/user-setting.entity';
import { UserSettingNotification } from 'src/modules/notifications/dto/notification-user-setting.dto';

@EntityRepository(UserSettingEntity)
export class UserSettingRepository extends Repository<UserSettingEntity> {
  private baseColumnSelect = [
    'users.id as user_id',
    'users.email as email',
    'users.title as user_title',
    'users.fullname as fullname',
    'user_setting.id as setting_id',
  ];

  async getUserEnableNotificationFromId(id: string): Promise<UserSettingNotification> {
    return this.createQueryBuilder('user_setting')
      .innerJoin('users', 'users', 'users.id = user_setting.user_id')
      .where(`user_setting.id > ${id}`)
      .andWhere(`user_setting.key = "${UserSettingKey.IsMailNotificationEnable}"`)
      .andWhere(`user_setting.value = 1`)
      .select(this.baseColumnSelect)
      .getRawOne();
  }

  async getUserEnableNotificationByUserId(userId: number): Promise<UserSettingNotification> {
    return this.createQueryBuilder('user_setting')
      .innerJoin('users', 'users', 'users.id = user_setting.user_id')
      .where(`user_setting.user_id = ${userId}`)
      .andWhere(`user_setting.key = "${UserSettingKey.IsMailNotificationEnable}"`)
      .andWhere(`user_setting.value = 1`)
      .select(this.baseColumnSelect)
      .getRawOne();
  }
}
