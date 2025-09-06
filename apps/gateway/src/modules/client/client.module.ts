import { Global, Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { USER_PACKAGE_NAME } from '@app/common/interfaces/auth';
import { join } from 'path/win32';
import { WALLET_PACKAGE_NAME } from '@app/common/interfaces/wallet';
import { config } from 'dotenv';
import { GrpcPackageNames, MARKET_PACKAGE_NAME } from '@app/common';
import { ORDER_PACKAGE_NAME } from '@app/common/interfaces/order';
config({
  path: ['.env'],
});

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: GrpcPackageNames.USER,
        transport: Transport.GRPC,
        options: {
          package: USER_PACKAGE_NAME,
          protoPath: join(process.cwd(), 'proto/user.proto'),
          url: process.env.USER_GRPC_URL,
        },
      },
      {
        name: GrpcPackageNames.ORDER,
        transport: Transport.GRPC,
        options: {
          package: ORDER_PACKAGE_NAME,
          protoPath: join(process.cwd(), 'proto/order.proto'),
          url: process.env.ORDER_GRPC_URL,
        },
      },
      {
        name: GrpcPackageNames.WALLET,
        transport: Transport.GRPC,
        options: {
          package: WALLET_PACKAGE_NAME,
          protoPath: join(process.cwd(), 'proto/wallet.proto'),
          url: process.env.WALLET_GRPC_URL,
        },
      },
      {
        name: GrpcPackageNames.MARKET,
        transport: Transport.GRPC,
        options: {
          package: MARKET_PACKAGE_NAME,
          protoPath: join(process.cwd(), 'proto/market.proto'),
          url: process.env.MARKET_GRPC_URL,
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class ClientGlobalModule {}
