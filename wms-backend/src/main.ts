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
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: string | boolean) => void,
    ) => {
      // Permite requisições sem origin (como mobile apps)
      if (!origin) {
        return callback(null, true);
      }

      // Expressão regular para verificar IPs da rede local
      const localNetworkRegex =
        /^https?:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/;

      // Verifica se é localhost, IP da rede local ou mobile app
      if (
        origin === 'http://151.243.0.78:3000' ||
        origin === 'http://151.243.0.78:3001' ||
        origin === 'http://151.243.0.78:3006' ||
        localNetworkRegex.test(origin) ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        callback(null, origin);
      } else {
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-New-Token'],
    exposedHeaders: ['X-New-Token'],
  });

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

  const port = process.env.PORT || 3005;

  await app.listen(port, () => {
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
