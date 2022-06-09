import { NotificationType } from 'src/models/entities/notification.entity';

export interface NotificationsWithStatus {
  id: number;
  n_status_id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  is_trash: number;
  created_at: Date;
  updated_at: Date;
  is_read: number;
  is_show: number;
}
