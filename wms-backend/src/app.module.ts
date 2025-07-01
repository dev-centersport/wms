import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { ArmazemModule } from './armazem/armazem.module';

const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5433,
  username: 'admin',
  password: 'senha123',
  database: 'wms_db',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true, // ATENÇÃO: usar apenas em desenvolvimento
  logging: true,
};

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), ProductsModule, ArmazemModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
