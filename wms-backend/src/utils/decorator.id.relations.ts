import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber } from 'class-validator';

export function idRelations() {
  return applyDecorators(
    Transform(({ value }: { value: string }) => parseInt(value, 10)),
    IsNumber(),
    IsNotEmpty(),
  );
}
