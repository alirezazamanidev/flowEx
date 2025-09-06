import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvConfig } from './configs/env.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmDbConfig } from './configs/typeorm.config';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { OrderEntity } from './entities/order.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GrpcPackageNames, WALLET_PACKAGE_NAME } from '@app/common';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(EnvConfig),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmDbConfig,
    }),

    TypeOrmModule.forFeature([OrderEntity]),
    ClientsModule.register([
     {
          name:GrpcPackageNames.WALLET,
          transport: Transport.GRPC,
          options: {
            package: WALLET_PACKAGE_NAME,
            protoPath: join(process.cwd(), 'proto/wallet.proto'),
            url:process.env.WALLET_GRPC_URL,
    
          },
        },
    ])
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
