import { Module } from '@nestjs/common';
import { ItemMovimentacaoService } from './item_movimentacao.service';
import { ItemMovimentacaoController } from './item_movimentacao.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemMovimentacao } from './entities/item_movimentacao.entity';
import { Movimentacao } from 'src/movimentacao/entities/movimentacao.entity';
import { ProdutoEstoque } from 'src/produto_estoque/entities/produto_estoque.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ItemMovimentacao, Movimentacao, ProdutoEstoque]),
  ],
  controllers: [ItemMovimentacaoController],
  providers: [ItemMovimentacaoService],
})
export class ItemMovimentacaoModule {}
