// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TimezoneInterceptor } from './interceptors/timezone.interceptor';

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

  app.useGlobalInterceptors(new TimezoneInterceptor());

  // Configuração básica do CORS (permite todas as origens)
  app.enableCors();

  // Habilitando o Cors
  // app.enableCors({
  //   origin: ['http://localhost:3000'], // Domínios permitidos
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Métodos permitidos
  //   allowedHeaders: 'Content-Type, Authorization', // Cabeçalhos permitidos
  //   credentials: true, // Permite cookies e autenticação
  // });

  await app.listen(3001);
}
bootstrap();
