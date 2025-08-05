import { PartialType } from '@nestjs/mapped-types';
import { CreateAgrupamentoDto } from './create-agrupamento.dto';

export class UpdateAgrupamentoDto extends PartialType(CreateAgrupamentoDto) {}
