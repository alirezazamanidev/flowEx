import { NestFactory } from '@nestjs/core';
import { GatewayModule } from './gateway.module';
import { getGlobalFilters } from 'apps/FlowEx/src/common/filters';
import { HttpValidationPipe } from 'apps/FlowEx/src/common/pipes/validation.pipe';
import { SwaggerConfig } from './configs/swagger.config';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(GatewayModule);

  app.setGlobalPrefix('api');
  app.useGlobalFilters(...getGlobalFilters());
  app.useGlobalPipes(new HttpValidationPipe());
  // swagger config
  SwaggerConfig(app);
  await app.listen(process.env.APP_PORT ?? 3000);
  console.log(`Swagger docs are available on: ${await app.getUrl()}/docs`);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
