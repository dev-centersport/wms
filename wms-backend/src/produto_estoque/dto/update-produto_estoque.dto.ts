import { PartialType } from '@nestjs/mapped-types';
import { CreateProdutoEstoqueDto } from './create-produto_estoque.dto';
import { IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProdutoEstoqueDto extends PartialType(
  CreateProdutoEstoqueDto,
) {
  @IsOptional()
  quantidade?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  produto_id?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  localizacao_id?: number;
}
