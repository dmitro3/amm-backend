import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({
  name: 'interval_settings',
})
export class IntervalSettings {
  @PrimaryColumn()
  interval: number;

  @Column({ name: 'by_the_interval' })
  by_the_interval: string;

  @Column()
  annualized: string;
}
