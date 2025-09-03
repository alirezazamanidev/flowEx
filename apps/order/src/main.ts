import { NestFactory } from '@nestjs/core';
import { OrderModule } from './order.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrderModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'order',
        protoPath: join(process.cwd(), 'proto/order.proto'),
        url:process.env.ORDER_GRPC_URL
      },
    },
  );
  await app.listen();

  console.log(`
  🚀  Order  Service is UP & Running!
  ----------------------------------
  📦 Service:   Order
  🔌 Protocol:  gRPC
  🌍 Address: ${process.env.ORDER_GRPC_URL}
  📂 Proto:     proto/order.proto
  ----------------------------------
  ✅ Ready to accept gRPC requests!
  `);
}
bootstrap();
