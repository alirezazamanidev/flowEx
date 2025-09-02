import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SwaggerTheme, SwaggerThemeNameEnum } from "swagger-themes";

export function SwaggerConfig(app: NestExpressApplication) {
  const config = new DocumentBuilder()
    .setTitle('API Documentation flowEx')
    .setDescription('API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const theme= new SwaggerTheme()
  const darkTheme=theme.getBuffer(SwaggerThemeNameEnum.ONE_DARK);
  SwaggerModule.setup('docs', app, document,{
    customCss:darkTheme.toString()
  });
}