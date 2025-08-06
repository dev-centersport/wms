import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateFileiraDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;

  @IsOptional()
  geom?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}
