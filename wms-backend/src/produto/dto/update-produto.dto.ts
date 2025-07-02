import { PartialType } from '@nestjs/mapped-types';
import { CreateProdutoDto } from './create-produto.dto';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Length,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProdutoDto extends PartialType(CreateProdutoDto) {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsPositive()
  id_tiny?: number;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  sku?: string;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  descricao?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  url_foto?: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  altura?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  largura?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  comprimento?: number;

  @IsOptional()
  @IsString()
  @Length(13, 13)
  ean?: string;
}
