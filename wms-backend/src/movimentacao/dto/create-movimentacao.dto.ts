import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { TipoMovimentacao } from '../entities/movimentacao.entity';
import { idRelations } from 'src/utils/decorator.id.relations';

export class CreateMovimentacaoDto {
  @IsNotEmpty()
  @IsEnum(TipoMovimentacao)
  tipo: TipoMovimentacao = TipoMovimentacao.ENTRADA;

  @IsNotEmpty()
  @IsNumber()
  quantidade: number;

  @idRelations()
  usuario_id: number;

  // Validação para quando for entrada ou transferência
  @ValidateIf(
    (o) =>
      o.tipo === TipoMovimentacao.TRANSFERENCIA ||
      o.tipo === TipoMovimentacao.ENTRADA,
  )
  @idRelations()
  localizacao_origem: number;

  @ValidateIf(
    (o) =>
      o.tipo === TipoMovimentacao.TRANSFERENCIA ||
      o.tipo === TipoMovimentacao.SAIDA,
  )
  @idRelations()
  localizacao_destino: number;
}
