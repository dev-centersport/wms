import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoLocalizacaoDto } from './create-tipo_localizacao.dto';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateTipoLocalizacaoDto extends PartialType(
  CreateTipoLocalizacaoDto,
) {
  @IsOptional()
  @IsString({ message: 'O tipo tem que ser uma string' })
  @IsNotEmpty({ message: 'O tipo não pode ser vazio' })
  tipo?: string;
}
