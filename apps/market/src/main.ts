import { NestFactory } from '@nestjs/core';
import { MarketModule } from './market.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { MARKET_PACKAGE_NAME, WALLET_PACKAGE_NAME } from '@app/common';
import { existsSync } from 'fs';

async function bootstrap() {
   const app = await NestFactory.createMicroservice<MicroserviceOptions>(
     MarketModule,
     {
       transport: Transport.GRPC,
       options: {
         package: MARKET_PACKAGE_NAME,
         protoPath: join(process.cwd(), 'proto/market.proto'),
         url:process.env.MARKET_GRPC_URL
       },
     },
   );

   await app.listen();
 
   console.log(`
   🚀  Market Service is UP & Running!
   ----------------------------------
   📦 Service:   Market
   🔌 Protocol:  gRPC
   🌍 Address: ${process.env.MARKET_GRPC_URL}
   📂 Proto:     proto/market.proto
   ----------------------------------
   ✅ Ready to accept gRPC requests!
   `);
}
bootstrap();
