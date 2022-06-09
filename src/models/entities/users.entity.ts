import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { jwtConstants } from 'src/modules/auth/constants';
import { Expose } from 'class-transformer';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Expose()
  title: string;

  @Column()
  @Expose()
  email: string;

  @Column()
  @Expose()
  company: string;

  @Column()
  @Expose()
  position: string;

  @Column()
  @Expose()
  fullname: string;

  @Column()
  @Expose()
  password: string;

  @Column()
  @Expose()
  phone: string;

  @Column({
    name: 'velo_account',
  })
  @Expose()
  velo_account: string;

  @Column({
    name: 'role',
  })
  role: number;

  @Column({
    name: 'status',
  })
  @Expose()
  status: number;

  @Column({
    name: 'is_locked',
  })
  @Expose()
  locked: number;

  @Column({
    name: 'is_first_login',
  })
  @Expose()
  is_first_login: boolean;

  @Column({
    name: 'user_type',
  })
  @Expose()
  user_type: number;

  @Column({
    name: 'token_reset_password',
  })
  @Expose()
  token_reset_password: number;

  @Column()
  @Expose()
  expire: Date;

  @Column()
  refresh_token: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  async actionBeforeInsert(): Promise<void> {
    this.password = await bcrypt.hash(this.password, jwtConstants.saltRound);
  }
}
