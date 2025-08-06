import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateFileiraDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;

  @IsString()
  @IsNotEmpty()
  geom: string;
}
