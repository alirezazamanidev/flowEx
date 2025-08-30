import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server,Socket } from 'socket.io';
import { NobitexRealtimeService } from './services/nobitex.service';
import { Logger } from '@nestjs/common';
import { MarketService } from './services/market.service';
@WebSocketGateway({ namespace: 'market' })
export class MarketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(MarketGateway.name);
  @WebSocketServer()
  server: Server;
  constructor(private marketService:MarketService){}
  

  handleConnection(client: any) {
    this.logger.log('client client connected');
  }
  handleDisconnect(client: any) {
    this.logger.log('client client disConnected');
  }
  @SubscribeMessage('getOneCandle')
  getOneCandle(@ConnectedSocket() client:Socket,@MessageBody() dto:{symbol:string,resolution:string}){
    return this.marketService.getOneCandle(dto.symbol,dto.resolution,client);

  }


}
