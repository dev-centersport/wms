import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateAgrupamentoDto {
  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsOptional()
  geom?: {
    type: 'Polygon';
    coordinates: number[][][];
  };

  @IsOptional()
  @IsNumber()
  lado_id?: number;
}
