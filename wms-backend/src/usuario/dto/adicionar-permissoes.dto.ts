import { IsArray, IsNumber } from 'class-validator';

export class AdicionarPermissoesDto {
  @IsArray()
  @IsNumber({}, { each: true })
  permissao_ids: number[];
}
