import { IsArray, IsNumber } from 'class-validator';

export class DefinirPermissoesDto {
  @IsArray()
  @IsNumber({}, { each: true })
  permissao_ids: number[];
}
