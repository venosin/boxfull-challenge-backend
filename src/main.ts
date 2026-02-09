import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1 Habilitar CORS
  // Esto permite que el Frontend (puerto 3001) hable con el Backend
  app.enableCors();

  // 2. Activamos validaciones globales (para que funcionen los DTOs)
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT || 3000);
}
bootstrap();