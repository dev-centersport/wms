import { IsNumber, IsOptional, IsPositive } from 'class-validator';
import { idRelations } from 'src/utils/decorator.id.relations';

export class CreateOcorrenciaDto {
  @idRelations()
  usuario_id: number;

  @idRelations()
  produto_estoque_id: number;

  @idRelations()
  localizacao_id: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  quantidade_esperada?: number;
}
