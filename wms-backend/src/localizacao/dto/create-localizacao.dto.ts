import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { StatusPrateleira } from '../entities/localizacao.entity';
import { MedidaInsercao } from 'src/utils/decorator.medidas';
import { idRelations } from 'src/utils/decorator.id.relations';

export class CreateLocalizacaoDto {
  @IsOptional()
  @IsEnum(StatusPrateleira)
  status?: StatusPrateleira = StatusPrateleira.FECHADA;

  @IsString()
  @IsNotEmpty()
  nome: string;

  @MedidaInsercao()
  altura?: number = 0;

  @MedidaInsercao()
  largura?: number = 0;

  @MedidaInsercao()
  comprimento?: number = 0;

  // @IsOptional()
  // @Length(13, 13, { message: 'O EAN deve ter exatamente 13 caracteres' })
  // @Validate(IsEAN13Valid, { message: 'EAN13 inválido' })
  // ean?: string;

  @idRelations()
  tipo_localizacao_id: number;

  @idRelations()
  armazem_id: number;
}
