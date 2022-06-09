import { CacheModule, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { EventsGateway } from 'src/modules/events/event.gateway';
import { redisConfig } from 'src/configs/redis.config';

@Module({
  providers: [EventsGateway],
  imports: [
    CacheModule.register({
      store: redisStore,
      host: redisConfig.host,
      port: redisConfig.port,
    }),
  ],
})
export class EventsModule {}
