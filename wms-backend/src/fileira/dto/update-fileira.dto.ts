import { PartialType } from '@nestjs/mapped-types';
import { CreateFileiraDto } from './create-fileira.dto';

export class UpdateFileiraDto extends PartialType(CreateFileiraDto) {}
