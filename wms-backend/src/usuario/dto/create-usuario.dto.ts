import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { idRelations } from 'src/utils/decorator.id.relations';
import { Entity } from 'typeorm';

@Entity()
export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  responsavel: string;

  @IsString()
  @IsNotEmpty()
  usuario: string;

  @IsString()
  @IsNotEmpty()
  senha: string;

  @IsNumber()
  @IsNotEmpty()
  nivel: number;

  @IsString()
  @IsNotEmpty()
  cpf: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean = true;

  @idRelations()
  perfil_id: number;
}
