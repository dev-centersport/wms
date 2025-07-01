import { PartialType } from '@nestjs/mapped-types';
import { CreateLocalizacaoDto } from './create-localizacao.dto';
import {
  IsDecimal,
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { StatusPrateleira } from '../entities/localizacao.entity';

export class UpdateLocalizacaoDto extends PartialType(CreateLocalizacaoDto) {
  @IsEnum(StatusPrateleira)
  @IsNotEmpty()
  status?: StatusPrateleira = StatusPrateleira.FECHADA;

  @IsString()
  @IsNotEmpty()
  nome?: string;

  @IsDecimal()
  @IsNotEmpty()
  altura?: number = 0;

  @IsDecimal()
  @IsNotEmpty()
  largura?: number = 0;

  @IsDecimal()
  @IsNotEmpty()
  comprimento?: number = 0;

  @IsString()
  @Length(13, 13, { message: 'O EAN deve ter entre 8 e 13 caracteres' })
  ean: string;
}
