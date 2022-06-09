import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'login_histories',
})
export class LoginHistories {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'user_id',
  })
  user_id: number;

  @Column({
    name: 'ip',
  })
  ip: string;

  @Column({
    name: 'device',
  })
  device: string;

  @CreateDateColumn()
  created_at: Date;
}
