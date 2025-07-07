import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoLocalizacaoDto } from './create-tipo_localizacao.dto';

export class UpdateTipoLocalizacaoDto extends PartialType(
  CreateTipoLocalizacaoDto,
) {}
