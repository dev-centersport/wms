import { IsEnum, IsNotEmpty, IsNumber, ValidateIf } from 'class-validator';
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
    (o: CreateMovimentacaoDto) =>
      o.tipo === TipoMovimentacao.TRANSFERENCIA ||
      o.tipo === TipoMovimentacao.ENTRADA,
  )
  @idRelations()
  localizacao_origem_id: number;

  @ValidateIf(
    (o: CreateMovimentacaoDto) =>
      o.tipo === TipoMovimentacao.TRANSFERENCIA ||
      o.tipo === TipoMovimentacao.SAIDA,
  )
  @idRelations()
  localizacao_destino_id: number;
}
