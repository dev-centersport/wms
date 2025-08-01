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
  can_view: boolean = true;

  @IsOptional()
  @IsBoolean()
  can_add: boolean = false;

  @IsOptional()
  @IsBoolean()
  can_edit: boolean = false;

  @IsOptional()
  @IsBoolean()
  can_delete: boolean = false;
}
