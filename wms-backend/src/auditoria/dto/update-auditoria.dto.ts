import { PartialType } from '@nestjs/mapped-types';
import { CreateAuditoriaDto } from './create-auditoria.dto';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsDate, IsEnum } from 'class-validator';
import { StatusAuditoria } from '../entities/auditoria.entity';

export class UpdateAuditoriaDto extends PartialType(CreateAuditoriaDto) {
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
