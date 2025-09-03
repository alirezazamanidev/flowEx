import { NestFactory } from '@nestjs/core';
import { WalletModule } from './wallet.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WALLET_PACKAGE_NAME } from '@app/common';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    WalletModule,
    {
      transport: Transport.GRPC,
      options: {
        package: WALLET_PACKAGE_NAME,
        protoPath: join(process.cwd(), 'proto/wallet.proto'),
        url: process.env.WALLET_GRPC_URL,
      },
    },
  );
  await app.listen();

  console.log(`
  🚀  Wallet Service is UP & Running!
  ----------------------------------
  📦 Service:   Order
  🔌 Protocol:  gRPC
  🌍 Address: ${process.env.WALLET_GRPC_URL}
  📂 Proto:     proto/wallet.proto
  ----------------------------------
  ✅ Ready to accept gRPC requests!
  `);
}
bootstrap();
