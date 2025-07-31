import { Module } from '@nestjs/common';
import { TipoLocalizacaoService } from './tipo_localizacao.service';
import { TipoLocalizacaoController } from './tipo_localizacao.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoLocalizacao } from './entities/tipo_localizacao.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([TipoLocalizacao]), AuthModule],
  controllers: [TipoLocalizacaoController],
  providers: [TipoLocalizacaoService],
})
export class TipoLocalizacaoModule {}
