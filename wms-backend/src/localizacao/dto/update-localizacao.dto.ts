import { PartialType } from '@nestjs/mapped-types';
import { CreateLocalizacaoDto } from './create-localizacao.dto';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { StatusPrateleira } from '../entities/localizacao.entity';
import { Transform } from 'class-transformer';
import { applyDecorators } from '@nestjs/common';

function MedidaDecimal() {
  return applyDecorators(
    IsOptional(),
    Transform(({ value }: { value: string }) => parseFloat(value)),
    IsNumber({ maxDecimalPlaces: 2 }),
    Min(0),
  );
}

export class UpdateLocalizacaoDto extends PartialType(CreateLocalizacaoDto) {
  @IsOptional()
  @IsEnum(StatusPrateleira)
  status?: StatusPrateleira = StatusPrateleira.FECHADA;

  @IsOptional()
  @IsString()
  nome?: string;

  @MedidaDecimal()
  altura?: number = 0;

  @MedidaDecimal()
  largura?: number = 0;

  @MedidaDecimal()
  comprimento?: number = 0;

  @IsOptional()
  @IsString()
  @Length(13, 13, { message: 'O EAN deve ter 13 caracteres' })
  ean?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  tipo_localizacao_id?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  armazem_id?: number;
}
