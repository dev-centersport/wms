import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { ArmazemModule } from './armazem/armazem.module';
import { TipoLocalizacaoModule } from './tipo_localizacao/tipo_localizacao.module';
import { LocalizacaoModule } from './localizacao/localizacao.module';
import { ProdutoModule } from './produto/produto.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { ProdutoEstoqueModule } from './produto_estoque/produto_estoque.module';
import { PerfilModule } from './perfil/perfil.module';
import { UsuarioModule } from './usuario/usuario.module';
import { LogsModule } from './logs/logs.module';
import { MovimentacaoModule } from './movimentacao/movimentacao.module';
import { ItemMovimentacaoModule } from './item_movimentacao/item_movimentacao.module';
import { OcorrenciaModule } from './ocorrencia/ocorrencia.module';
import { AuditoriaModule } from './auditoria/auditoria.module';
import { ItemAuditoriaModule } from './item_auditoria/item_auditoria.module';
import { SeparacaoModule } from './separacao/separacao.module';

// const typeOrmConfig: TypeOrmModuleOptions = {
//   type: 'postgres',
//   host: 'localhost',
//   port: 5433,
//   username: 'admin',
//   password: 'senha123',
//   database: 'wms_db',
//   entities: [__dirname + '/**/*.entity{.ts,.js}'],
//   autoLoadEntities: true,
//   synchronize: true, // ATENÇÃO: usar apenas em desenvolvimento
//   logging: true,
// };

// @Module({
//   imports: [
//     TypeOrmModule.forRoot({typeOrmConfig}),
//     ProductsModule,
//     ArmazemModule,
//     TipoLocalizacaoModule,
//     LocalizacaoModule,
//     ProdutoModule,
//   ],
//   controllers: [AppController],
//   providers: [AppService],
// })

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(
        __dirname,
        '../.env.' + (process.env.NODE_ENV || 'development'),
      ),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', '192.168.56.1'),
        port: config.get<number>('DB_PORT', 5433),
        username: config.get<string>('DB_USERNAME', 'admin'),
        password: config.get<string>('DB_PASSWORD', 'senha123'),
        database: config.get<string>('DB_NAME', 'wms_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: config.get<boolean>('DB_SYNCHRONIZE', true),
        logging: config.get<boolean>('DB_LOGGING', true),
        timezone: 'UTC',
        extra: {
          options: '-c timezone=UTC',
        },
      }),
    }),
    ProductsModule,
    ArmazemModule,
    TipoLocalizacaoModule,
    LocalizacaoModule,
    ProdutoModule,
    ProdutoEstoqueModule,
    PerfilModule,
    UsuarioModule,
    LogsModule,
    MovimentacaoModule,
    ItemMovimentacaoModule,
    OcorrenciaModule,
    AuditoriaModule,
    ItemAuditoriaModule,
    SeparacaoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
