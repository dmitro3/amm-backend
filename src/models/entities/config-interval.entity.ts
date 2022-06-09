import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({
  name: 'config_interval',
})
export class ConfigIntervalEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: ConfigIntervalType;

  @Column()
  user_id: number;

  @Column()
  interval: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

export enum ConfigIntervalType {
  Volatility = 1,
  Confidence = 2,
}

export enum ConfigIntervalErrorStatus {
  InvalidType = 'INVALID_TYPE',
  InvalidTimeType = 'INVALID_TIME_TYPE',
  InvalidTime = 'INVALID_TIME',
  InvalidConfigVolatility = 'INVALID_CONFIG_VOLATILITY',
  InvalidConfigVolatilityAdmin = 'INVALID_CONFIG_VOLATILITY_ADMIN',
  InvalidConfigVolatilityUser = 'INVALID_CONFIG_VOLATILITY_USER',
  InvalidConfigConfidence = 'INVALID_CONFIG_CONFIDENCE',
}

export const DEFAULT_INTERVAL = 1;
export const CALCULATION_INTERVAL_CONFIDENCE = 525600;
