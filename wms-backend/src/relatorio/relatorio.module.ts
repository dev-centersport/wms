import { Module } from '@nestjs/common';
import { RelatorioService } from './relatorio.service';
import { RelatorioController } from './relatorio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdutoEstoque } from 'src/produto_estoque/entities/produto_estoque.entity';
import { Localizacao } from 'src/localizacao/entities/localizacao.entity';
import { Produto } from 'src/produto/entities/produto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProdutoEstoque, Localizacao, Produto])],
  controllers: [RelatorioController],
  providers: [RelatorioService],
})
export class RelatorioModule {}
