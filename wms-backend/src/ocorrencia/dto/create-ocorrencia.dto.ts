import { IsNumber, IsPositive } from 'class-validator';
import { idRelations } from 'src/utils/decorator.id.relations';

export class CreateOcorrenciaDto {
  @idRelations()
  usuario_id: number;

  @idRelations()
  produto_estoque_id: number;

  @idRelations()
  localizacao_id: number;

  @IsNumber()
  @IsPositive()
  quantidade_esperada?: number;
}
