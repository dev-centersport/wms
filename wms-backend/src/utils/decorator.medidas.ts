import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';

export function MedidaInsercao() {
  return applyDecorators(
    IsOptional(),
    Transform(({ value }: { value: string }) => parseFloat(value)),
    IsNumber({ maxDecimalPlaces: 2 }),
    Min(0),
  );
}
