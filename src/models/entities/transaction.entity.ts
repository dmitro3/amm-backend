import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({
  name: 'transactions',
})
export class TransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  network: number;

  @Column()
  rawId: number;

  @Column()
  status: string;

  @Column()
  txid: string;

  @Column()
  signed_transaction: string;

  @Column()
  note: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export enum TransactionStatus {
  Pending = 'pending',
  Unsigned = 'unsigned',
  Signed = 'signed',
  Sent = 'sent',
  Complete = 'complete',
  Failed = 'failed',
}

export enum TransactionTypes {
  Match = 'match',
  Cancel = 'cancel',
}
