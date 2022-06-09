import { getConfig } from 'src/configs/index';

export interface RedisConfig {
  host: string;
  port: number;
}

export const redisConfig = {
  ...getConfig().get<RedisConfig>('redis'),
};
