import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePerfilDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nome: string;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsBoolean()
  pode_ver: boolean = true;

  @IsOptional()
  @IsBoolean()
  pode_add: boolean = false;

  @IsOptional()
  @IsBoolean()
  pode_edit: boolean = false;

  @IsOptional()
  @IsBoolean()
  pode_delete: boolean = false;
}
