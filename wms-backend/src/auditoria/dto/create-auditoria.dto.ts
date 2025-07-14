import { StatusAuditoria } from '../entities/auditoria.entity';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { idRelations } from 'src/utils/decorator.id.relations';

export class CreateAuditoriaDto {
  @idRelations()
  usuario_id: number;

  @idRelations()
  ocorrencia_id: number;

  @idRelations()
  localizacao_id: number;

  @IsOptional()
  @IsString()
  conclusao?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  data_hora_inicio?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  data_hora_conclusao?: Date;

  @IsOptional()
  @IsEnum(StatusAuditoria)
  status?: StatusAuditoria;
}
