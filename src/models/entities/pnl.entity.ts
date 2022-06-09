import { Entity, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'pnls',
})
export class PnlEntity {
  @PrimaryColumn()
  date: string;

  @PrimaryColumn()
  user_id: number;

  @PrimaryColumn()
  wallet: string;

  @PrimaryColumn()
  symbol: string;

  @Column()
  balance: string;

  @Column()
  rate: string;

  @Column()
  trade_amount: string;

  @Column()
  transfer_amount: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
