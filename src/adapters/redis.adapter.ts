/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as redisIoAdapter from 'socket.io-redis';
import { redisConfig } from 'src/configs/redis.config';

export class RedisIoAdapter extends IoAdapter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createIOServer(port: number, options?: any): any {
    const server = super.createIOServer(port, options);
    const redisAdapter = redisIoAdapter({ host: redisConfig.host, port: redisConfig.port });

    server.adapter(redisAdapter);
    return server;
  }
}
