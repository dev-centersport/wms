import { idRelations } from 'src/utils/decorator.id.relations';

export class CreateOcorrenciaDto {
  @idRelations()
  usuario_id: number;

  @idRelations()
  produto_estoque_id: number;
}
