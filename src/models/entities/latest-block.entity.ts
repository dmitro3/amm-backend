import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'latest_block' })
export class LatestBlockEntity {
  @PrimaryColumn()
  network: string;

  @PrimaryColumn()
  type: string;

  @Column()
  block: string;

  @Column()
  status: LatestBlockStatus;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}

export enum LatestBlockStatus {
  Done = 1,
}
