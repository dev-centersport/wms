import { StatusAuditoria } from '../entities/auditoria.entity';
import { IsDate, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAuditoriaDto {
  @IsInt()
  usuario_id: number;

  @IsInt()
  ocorrencia_id: number;

  @IsInt()
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
