import { Module } from '@nestjs/common';
import { ProdutoService } from './produto.service';
import { ProdutoController } from './produto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produto } from './entities/produto.entity';
import { IsEAN13Valid } from 'src/localizacao/validators/ean13.validator';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Produto]), AuthModule],
  controllers: [ProdutoController],
  providers: [ProdutoService, IsEAN13Valid],
})
export class ProdutoModule {}
