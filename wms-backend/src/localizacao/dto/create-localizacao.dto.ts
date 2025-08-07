import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Posicao, StatusPrateleira } from '../entities/localizacao.entity';
import { MedidaInsercao } from 'src/utils/decorator.medidas';
import { idRelations } from 'src/utils/decorator.id.relations';

export class CreateLocalizacaoDto {
  @IsOptional()
  @IsEnum(StatusPrateleira)
  status?: StatusPrateleira = StatusPrateleira.FECHADA;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;

  @MedidaInsercao()
  altura?: number = 0;

  @MedidaInsercao()
  largura?: number = 0;

  @MedidaInsercao()
  comprimento?: number = 0;

  @IsNotEmpty()
  @IsEnum(Posicao)
  posicao: Posicao;

  @IsOptional()
  geom?: {
    type: 'Polygon';
    coordinates: number[][][];
  };

  // @IsOptional()
  // @Length(13, 13, { message: 'O EAN deve ter exatamente 13 caracteres' })
  // @Validate(IsEAN13Valid, { message: 'EAN13 inválido' })
  // ean?: string;

  @idRelations()
  tipo_localizacao_id: number;

  @idRelations()
  armazem_id: number;

  @IsOptional()
  @idRelations()
  agrupamento_id?: number;
}
