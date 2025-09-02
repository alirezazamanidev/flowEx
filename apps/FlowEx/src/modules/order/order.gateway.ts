import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { OrderService } from './services/order.service';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { isJWT } from 'class-validator';

@WebSocketGateway({ namespace: 'order' })
export class OrderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(OrderGateway.name);
  @WebSocketServer()
  public server:Server
  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    await this.authenticate(client);

    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    client.leave(client.data.user.userId);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async authenticate(client: Socket) {
    try {
      const token = client.handshake.headers?.['authorization'];

      if (!token || !isJWT(token)) {
        client.emit('exception', 'Unauthorized');
        client.disconnect();
        return;
      }
      const user = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });
      client.data.user = user;
      client.join(user.userId);
    } catch (error) {
      console.log(error);
      client.emit('exception', 'Unauthorized');
      client.disconnect();
    }
  }
}
