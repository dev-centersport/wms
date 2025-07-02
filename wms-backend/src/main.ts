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

  // Habilitando o Cors
  app.enableCors({
    origin: ['http://172.22.160.1:3000', 'http://localhost:3001'], // Domínios permitidos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Métodos permitidos
    allowedHeaders: 'Content-Type, Authorization', // Cabeçalhos permitidos
    credentials: true, // Permite cookies e autenticação
  });

  await app.listen(3001);
}
bootstrap();
