import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject, OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { MARKET_SERVICE_NAME, MarketServiceClient } from '@app/common';
import { GrpcPackageNames } from '../../common/enums/grpc.enum';
import type { ClientGrpc } from '@nestjs/microservices';

@WebSocketGateway({ namespace: 'market' })
export class MarketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  private marketServiceClinet: MarketServiceClient;
  constructor(
    @Inject(GrpcPackageNames.MARKET) private readonly marketClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.marketServiceClinet =
      this.marketClient.getService<MarketServiceClient>(MARKET_SERVICE_NAME);
  }
  @WebSocketServer()
  public server: Server;

  handleConnection(client: any, ...args: any[]) {
    console.log('Client connected:', client.id);
  }
  handleDisconnect(client: any) {
    console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('subscribeToCandles')
  handleSubscribeToCandles(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: { symbol: string; resolution: string },
  ) {
    this.marketServiceClinet.streamCandles(dto).subscribe({
      next: (candle) => {
        client.emit('candle', candle);
      },
      error: (err) => {
        console.log(err);
        client.emit('error', err);
      },
    });
  }
}
