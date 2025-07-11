import { PartialType } from '@nestjs/mapped-types';
import { CreateOcorrenciaDto } from './create-ocorrencia.dto';
import { IsBoolean } from 'class-validator';

export class UpdateOcorrenciaDto extends PartialType(CreateOcorrenciaDto) {
  @IsBoolean()
  ativo: boolean;
}
