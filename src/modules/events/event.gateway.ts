import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Socket, Server } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { jwtConstants } from 'src/modules/auth/constants';

@WebSocketGateway()
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(CACHE_MANAGER)
    public cacheManager: Cache,
  ) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');
  private socketIds = {};

  handleDisconnect(client: Socket): void {
    const userId = this.socketIds[client.id];
    if (userId) {
      this.logger.log(`User ${userId} disconnected: ${client.id}`);
    } else {
      this.logger.log(`Guest disconnected: ${client.id}`);
    }
  }

  async handleConnection(client: Socket): Promise<void> {
    const token = client.handshake.query?.authorization;
    if (token) {
      try {
        const payload = verify(token, jwtConstants.accessTokenSecret) as { sub: number };
        await this.cacheManager.set(EventsGateway.getSocketIdKey(payload.sub), client.id, {
          ttl: 604800,
        });
        this.socketIds[client.id] = payload.sub;
        this.logger.log(`User ${payload.sub} connected: ${client.id}`);
      } catch (e) {
        this.logger.log(`Failed to decode access token for client ${client.id}`);
      }
    } else {
      this.logger.log(`Guest connected: ${client.id}`);
    }
  }

  public static getSocketIdKey(userId: number): string {
    return `socket_id_${userId}`;
  }
}
