import { Module } from '@nestjs/common';
import { TipoLocalizacaoService } from './tipo_localizacao.service';
import { TipoLocalizacaoController } from './tipo_localizacao.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoLocalizacao } from './entities/tipo_localizacao.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TipoLocalizacao, Usuario]), AuthModule],
  controllers: [TipoLocalizacaoController],
  providers: [TipoLocalizacaoService],
})
export class TipoLocalizacaoModule {}
