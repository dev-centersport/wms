import { IsNotEmpty, IsNumber } from 'class-validator';
import { idRelations } from 'src/utils/decorator.id.relations';

export class CreateProdutoEstoqueDto {
  @IsNumber()
  @IsNotEmpty()
  quantidade: number;

  @idRelations()
  produto_id: number;

  @idRelations()
  localizacao_id: number;
}
