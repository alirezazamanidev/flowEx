import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { AllExceptionFilter } from './common/filters/all-exception.filter';
import { SwaggerConfig } from './configs/swagger.config';
import { HttpValidationPipe } from './common/pipes/validation.pipe';
import { getGlobalFilters } from './common/filters';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // app configs
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
