import { PartialType } from '@nestjs/mapped-types';
import { CreateProdutoEstoqueDto } from './create-produto_estoque.dto';

export class UpdateProdutoEstoqueDto extends PartialType(
  CreateProdutoEstoqueDto,
) {}
