import { IsArray, IsNumber } from 'class-validator';

export class RemoverPermissoesDto {
  @IsArray()
  @IsNumber({}, { each: true })
  permissao_ids: number[];
}
