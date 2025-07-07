import { PartialType } from '@nestjs/mapped-types';
import { CreateProdutoDto } from './create-produto.dto';
import { IsEAN, IsOptional, IsString, Length } from 'class-validator';

export class UpdateProdutoDto extends PartialType(CreateProdutoDto) {
  @IsOptional()
  @IsString()
  @IsEAN()
  @Length(13, 13, { message: 'O EAN deve ter 13 caracteres' })
  ean?: string;
}
