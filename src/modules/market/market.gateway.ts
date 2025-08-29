import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { NobitexRealtimeService } from './services/nobitex.service';
import { Logger } from '@nestjs/common';
import { MarketService } from './services/market.service';
@WebSocketGateway({ namespace: 'market' })
export class MarketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(MarketGateway.name);
  @WebSocketServer()
  server: Server;
  constructor(private readonly marketService: MarketService) {}

  handleConnection(client: any) {
    this.logger.log('client client connected');
  }
  handleDisconnect(client: any) {
    this.logger.log('client client disConnected');
  }

  broadcastMarketUpdate(data: any) {
    this.server.emit('marketUpdate', data);
  }
}
