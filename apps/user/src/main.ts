import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { join } from 'path';
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'user',
        protoPath: join(process.cwd(), 'proto/user.proto'),
        url:process.env.USER_GRPC_URL
      },
    },
  );
  await app.listen();

  console.log(`
  🚀  User  Service is UP & Running!
  ----------------------------------
  📦 Service:   User
  🔌 Protocol:  gRPC
  🌍 Address: ${process.env.USER_GRPC_URL}
  📂 Proto:     proto/user.proto
  ----------------------------------
  ✅ Ready to accept gRPC requests!
  `);
}
bootstrap();
