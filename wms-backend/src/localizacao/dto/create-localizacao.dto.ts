import {
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { StatusPrateleira } from '../entities/localizacao.entity';

export class CreateLocalizacaoDto {
  @IsEnum(StatusPrateleira)
  @IsNotEmpty()
  status: StatusPrateleira;

  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsDecimal()
  @IsNotEmpty()
  @IsOptional()
  altura?: number;

  @IsDecimal()
  @IsNotEmpty()
  @IsOptional()
  largura?: number;

  @IsDecimal()
  @IsNotEmpty()
  @IsOptional()
  comprimento?: number;

  // @IsOptional()
  // @Length(13, 13, { message: 'O EAN deve ter exatamente 13 caracteres' })
  // @Validate(IsEAN13Valid, { message: 'EAN13 inválido' })
  // ean?: string;

  @IsNumber()
  @IsNotEmpty()
  tipo_localizacao_id: number;

  @IsNumber()
  @IsNotEmpty()
  armazem_id: number;
}
