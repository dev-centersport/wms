import { Module } from '@nestjs/common';
import { MovimentacaoService } from './movimentacao.service';
import { MovimentacaoController } from './movimentacao.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movimentacao } from './entities/movimentacao.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Localizacao } from 'src/localizacao/entities/localizacao.entity';
import { ItemMovimentacao } from 'src/item_movimentacao/entities/item_movimentacao.entity';
import { ProdutoEstoque } from 'src/produto_estoque/entities/produto_estoque.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Movimentacao,
      Usuario,
      Localizacao,
      ItemMovimentacao,
      ProdutoEstoque,
    ]),
    AuthModule,
  ],
  controllers: [MovimentacaoController],
  providers: [MovimentacaoService],
})
export class MovimentacaoModule {}
