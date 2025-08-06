// separacao.module.ts
import { Module } from '@nestjs/common';
import { SeparacaoController } from './separacao.controller';
import { SeparacaoService } from './separacao.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Localizacao } from 'src/localizacao/entities/localizacao.entity';
import { Produto } from 'src/produto/entities/produto.entity';
import { ProdutoEstoque } from 'src/produto_estoque/entities/produto_estoque.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Localizacao, Produto, ProdutoEstoque, Usuario]),
    AuthModule,
  ],
  controllers: [SeparacaoController],
  providers: [SeparacaoService],
})
export class SeparacaoModule {}
