import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { StatusAuditoria } from '../entities/auditoria.entity';
import { idRelations } from 'src/utils/decorator.id.relations';

export class CreateAuditoriaDto {
  @IsNotEmpty()
  @IsString()
  conclusao: string;

  @IsNotEmpty()
  @IsEnum(StatusAuditoria)
  status: StatusAuditoria = StatusAuditoria.CONCLUIDA;

  @idRelations()
  usuario_id: number;

  @idRelations()
  ocorrencia_id: number;
}
