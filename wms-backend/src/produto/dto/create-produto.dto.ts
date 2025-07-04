import {
  IsEAN,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  Validate,
} from 'class-validator';
import { IsEAN13Valid } from 'src/localizacao/validators/ean13.validator';
import { MedidaInsercao } from 'src/utils/decorator.medidas';

export class CreateProdutoDto {
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsPositive()
  @IsNotEmpty()
  id_tiny: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsString()
  @IsUrl() // Para validar urls, mas talvez mude
  @IsOptional()
  @MaxLength(255)
  url_foto?: string;

  @MedidaInsercao()
  altura?: number;

  @MedidaInsercao()
  largura?: number;

  @MedidaInsercao()
  comprimento?: number;

  @Validate(IsEAN13Valid)
  @IsEAN()
  @IsNotEmpty()
  @Length(13, 13)
  @IsOptional() // Torna opcional
  ean?: string;
}
