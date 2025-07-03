import { PartialType } from '@nestjs/mapped-types';
import { CreateLocalizacaoDto } from './create-localizacao.dto';
import {
  IsDefined,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { StatusPrateleira } from '../entities/localizacao.entity';
import { Transform } from 'class-transformer';

export class UpdateLocalizacaoDto extends PartialType(CreateLocalizacaoDto) {
  @IsOptional()
  @IsDefined()
  @IsEnum(StatusPrateleira)
  status?: StatusPrateleira = StatusPrateleira.FECHADA;

  @IsOptional()
  @IsDefined()
  @IsString()
  nome?: string;

  @IsOptional()
  @Transform(({ value }: { value: string }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  altura?: number = 0;

  @IsOptional()
  @Transform(({ value }: { value: string }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  largura?: number = 0;

  @IsOptional()
  @Transform(({ value }: { value: string }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  comprimento?: number = 0;

  @IsOptional()
  @IsDefined()
  @IsString()
  @Length(13, 13, { message: 'O EAN deve ter 13 caracteres' })
  ean?: string;

  @IsOptional()
  @IsDefined()
  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  tipo_localizacao_id?: number;

  @IsOptional()
  @IsDefined()
  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  armazem_id?: number;
}
