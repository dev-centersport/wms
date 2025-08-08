import { IsEnum, IsBoolean } from 'class-validator';
import { Modulo } from '../entities/permissao.entity';

export class CreatePermissaoDto {
  @IsEnum(Modulo)
  modulo: Modulo;

  @IsBoolean()
  pode_ver: boolean;

  @IsBoolean()
  pode_incluir: boolean;

  @IsBoolean()
  pode_editar: boolean;

  @IsBoolean()
  pode_excluir: boolean;
}
