import { Module } from '@nestjs/common';
import { OcorrenciaService } from './ocorrencia.service';
import { OcorrenciaController } from './ocorrencia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ocorrencia } from './entities/ocorrencia.entity';
import { ProdutoEstoque } from 'src/produto_estoque/entities/produto_estoque.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ocorrencia, ProdutoEstoque, Usuario])],
  controllers: [OcorrenciaController],
  providers: [OcorrenciaService],
})
export class OcorrenciaModule {}
