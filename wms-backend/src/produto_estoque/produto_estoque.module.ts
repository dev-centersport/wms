import { Module } from '@nestjs/common';
import { ProdutoEstoqueService } from './produto_estoque.service';
import { ProdutoEstoqueController } from './produto_estoque.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdutoEstoque } from './entities/produto_estoque.entity';
import { Localizacao } from 'src/localizacao/entities/localizacao.entity';
import { Produto } from 'src/produto/entities/produto.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProdutoEstoque, Localizacao, Produto]),
    AuthModule,
  ],
  controllers: [ProdutoEstoqueController],
  providers: [ProdutoEstoqueService],
})
export class ProdutoEstoqueModule {}
