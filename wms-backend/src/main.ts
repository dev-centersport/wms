// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TimezoneInterceptor } from './interceptors/timezone.interceptor';
import { Request, Response } from 'express';
import session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    session({
      secret: 'uma_senha_secreta', // Troque em produção!
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 3600000 }, // 1h
    }),
  );

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

  app.use('/health', (req: Request, res: Response) => {
    try {
      res.status(200).json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      });
    } catch (error: unknown) {
      res.status(503).json({
        status: 'DOWN',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  await app.listen(3001, () => {
    // Sinaliza prontidão para o PM2
    if (process.send) {
      process.send('ready');
    }
    console.log('✅ Aplicação pronta');
  });

  // Tratamento de erros não capturados
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
  });
}
bootstrap();
