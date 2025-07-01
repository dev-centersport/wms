import { Module } from '@nestjs/common';
import { TipoLocalizacaoService } from './tipo_localizacao.service';
import { TipoLocalizacaoController } from './tipo_localizacao.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoLocalizacao } from './entities/tipo_localizacao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoLocalizacao])],
  controllers: [TipoLocalizacaoController],
  providers: [TipoLocalizacaoService],
})
export class TipoLocalizacaoModule {}
