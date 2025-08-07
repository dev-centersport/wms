import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Validate,
} from 'class-validator';
import { idRelations } from 'src/utils/decorator.id.relations';
import { Entity } from 'typeorm';
import { MovimentacaoSet } from '../entities/usuario.entity';

// Validador customizado para verificar se a senha não contém espaços
class SenhaSemEspacosValidator {
  validate(senha: string): boolean {
    return !senha.includes(' ');
  }

  defaultMessage(): string {
    return 'A senha não pode conter espaços';
  }
}

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
  @Validate(SenhaSemEspacosValidator)
  senha: string;

  @IsNumber()
  @IsNotEmpty()
  nivel: number;

  @IsEnum(MovimentacaoSet)
  @IsNotEmpty()
  movimentacao_set: MovimentacaoSet = MovimentacaoSet.ENTRADA;

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
