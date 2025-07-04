import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { idRelations } from 'src/utils/decorator.id.relations';
import { Entity } from 'typeorm';

@Entity()
export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  responsavel: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  usuario: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  senha: string;

  @IsNumber()
  @IsNotEmpty()
  nivel: number;

  @IsString()
  @IsNotEmpty()
  @Length(11, 11)
  cpf: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean = true;

  @idRelations()
  perfil_id: number;
}
