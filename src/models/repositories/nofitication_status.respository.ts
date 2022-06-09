import { EntityRepository, Repository } from 'typeorm';
import { NotificationStatusEntity } from 'src/models/entities/notification_status.entity';

@EntityRepository(NotificationStatusEntity)
export class NotificationStatusRepository extends Repository<NotificationStatusEntity> {}
