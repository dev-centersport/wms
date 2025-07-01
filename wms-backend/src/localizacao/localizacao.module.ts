import { Module } from '@nestjs/common';
import { LocalizacaoService } from './localizacao.service';
import { LocalizacaoController } from './localizacao.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Localizacao } from './entities/localizacao.entity';
import { TipoLocalizacao } from 'src/tipo_localizacao/entities/tipo_localizacao.entity';
import { Armazem } from 'src/armazem/entities/armazem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Localizacao, TipoLocalizacao, Armazem])],
  controllers: [LocalizacaoController],
  providers: [LocalizacaoService],
})
export class LocalizacaoModule {}
