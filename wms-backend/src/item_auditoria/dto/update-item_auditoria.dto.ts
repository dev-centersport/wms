import { PartialType } from '@nestjs/mapped-types';
import { CreateItemAuditoriaDto } from './create-item_auditoria.dto';

export class UpdateItemAuditoriaDto extends PartialType(
  CreateItemAuditoriaDto,
) {}
