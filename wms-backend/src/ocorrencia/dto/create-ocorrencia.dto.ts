import { idRelations } from 'src/utils/decorator.id.relations';

export class CreateOcorrenciaDto {
  @idRelations()
  produto_estoque_id: number;
}
