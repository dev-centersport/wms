import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTipoLocalizacaoDto {
  @IsString({ message: 'O tipo tem que ser uma string' })
  @IsNotEmpty({ message: 'O tipo não pode ser vazio' })
  tipo: string;
}
