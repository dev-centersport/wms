// separacao.module.ts
import { Module } from '@nestjs/common';
import { SeparacaoController } from './separacao.controller';
import { SeparacaoService } from './separacao.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Localizacao } from 'src/localizacao/entities/localizacao.entity';
import { Produto } from 'src/produto/entities/produto.entity';
import { ProdutoEstoque } from 'src/produto_estoque/entities/produto_estoque.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Localizacao, Produto, ProdutoEstoque])],
  controllers: [SeparacaoController],
  providers: [SeparacaoService],
})
export class SeparacaoModule {}
