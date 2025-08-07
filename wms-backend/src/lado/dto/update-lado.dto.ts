import { PartialType } from '@nestjs/mapped-types';
import { CreateLadoDto } from './create-lado.dto';

export class UpdateLadoDto extends PartialType(CreateLadoDto) {}
