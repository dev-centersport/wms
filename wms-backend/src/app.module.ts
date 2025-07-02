import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { ArmazemModule } from './armazem/armazem.module';
import { TipoLocalizacaoModule } from './tipo_localizacao/tipo_localizacao.module';
import { LocalizacaoModule } from './localizacao/localizacao.module';

const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: '151.243.0.78',
  port: 5432,
  username: 'wms_user',
  password: 'center2025',
  database: 'wms_db',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  autoLoadEntities: true,
  synchronize: true, // ATENÇÃO: usar apenas em desenvolvimento
  logging: true,
};

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ProductsModule,
    ArmazemModule,
    TipoLocalizacaoModule,
    LocalizacaoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
