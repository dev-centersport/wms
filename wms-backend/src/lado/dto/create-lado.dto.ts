import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateLadoDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nome: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 1)
  lado: string;

  @IsOptional()
  @IsNumber()
  fileira_id?: number;
}
