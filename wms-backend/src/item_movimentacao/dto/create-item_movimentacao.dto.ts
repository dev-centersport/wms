import { IsNotEmpty, IsNumber } from 'class-validator';
import { idRelations } from 'src/utils/decorator.id.relations';

export class CreateItemMovimentacaoDto {
  @IsNotEmpty()
  @IsNumber()
  quantidade: number;

  @idRelations()
  produto_id: number;

  // @idRelations()
  // movimentacao_id: number;
}
