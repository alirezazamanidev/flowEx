import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
    ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { isJWT } from 'class-validator';
import { Server, Socket } from 'socket.io';
import { WalletService } from './wallet.service';

@WebSocketGateway({ namespace: 'wallet' })
export class WalletGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger(WalletGateway.name);
  @WebSocketServer()
  server: Server;
  constructor(private readonly jwtService:JwtService,private walletService:WalletService){}
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
