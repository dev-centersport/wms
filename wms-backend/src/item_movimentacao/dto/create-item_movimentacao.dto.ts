import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';
import { idRelations } from 'src/utils/decorator.id.relations';

export class CreateItemMovimentacaoDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  quantidade: number;

  @idRelations()
  produto_id: number;

  @idRelations()
  produto_estoque_id: number;

  // @idRelations()
  // movimentacao_id: number;
}
