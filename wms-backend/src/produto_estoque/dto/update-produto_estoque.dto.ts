import { PartialType } from '@nestjs/mapped-types';
import { CreateProdutoEstoqueDto } from './create-produto_estoque.dto';
import { IsDefined, IsNumber, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProdutoEstoqueDto extends PartialType(
  CreateProdutoEstoqueDto,
) {
  @IsOptional()
  @IsDefined()
  quantidade?: number;

  @IsOptional()
  @IsDefined()
  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  produto_id?: number;

  @IsOptional()
  @IsDefined()
  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  localizacao_id?: number;
}
