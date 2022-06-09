import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({
  name: 'history_logs',
})
export class HistoryLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  activity_type: string;

  @Column()
  admin_id: number;

  @Column()
  wallet: string;

  @Column()
  activities: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export enum ActivityType {
  Download = 'download',
  Upload = 'upload',
  ManageOrderBook = 'manage_order_book',
  ManagePool = 'manage_pool',
  ManageUser = 'manage_user',
  ManageAdmin = 'manage_admin',
}
