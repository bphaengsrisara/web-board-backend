import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Web Board API')
      .setDescription('The Web Board API description')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    credentials: true,
    // ! don't allow all in production
    origin: true,
  });
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
