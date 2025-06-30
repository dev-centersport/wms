// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração global do ValidationPipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove propriedades não incluídas no DTO
      forbidNonWhitelisted: true, // lança erro se tiver propriedades não permitidas
      transform: true, // transforma os tipos automaticamente (ex: string para number)
    }),
  );

  await app.listen(3000);
}
bootstrap();
