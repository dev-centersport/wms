import { Transform } from 'class-transformer';
import {
  IsEAN,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Length,
  Min,
  Validate,
} from 'class-validator';
import { IsEAN13Valid } from 'src/localizacao/validators/ean13.validator';

export class CreateProdutoDto {
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsPositive()
  @IsNotEmpty()
  id_tiny: number;

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  sku: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  descricao: string;

  @IsString()
  @IsUrl() // Para validar urls, mas talvez mude
  @IsOptional()
  url_foto?: string;

  @IsOptional()
  @Transform(({ value }: { value: string }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  altura?: number;

  @IsOptional()
  @Transform(({ value }: { value: string }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  largura?: number;

  @IsOptional()
  @Transform(({ value }: { value: string }) => parseFloat(value))
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  comprimento?: number;

  @Validate(IsEAN13Valid)
  @IsEAN()
  @IsNotEmpty()
  @Length(13, 13)
  @IsOptional() // Torna opcional
  ean?: string;
}
