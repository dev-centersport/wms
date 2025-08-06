import { Module } from '@nestjs/common';
import { LocalizacaoService } from './localizacao.service';
import { LocalizacaoController } from './localizacao.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Localizacao } from './entities/localizacao.entity';
import { Armazem } from 'src/armazem/entities/armazem.entity';
import { TipoLocalizacao } from 'src/tipo_localizacao/entities/tipo_localizacao.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Localizacao, TipoLocalizacao, Armazem, Usuario]),
    AuthModule,
  ],
  controllers: [LocalizacaoController],
  providers: [LocalizacaoService],
})
export class LocalizacaoModule {}
