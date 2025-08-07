import { PartialType } from '@nestjs/mapped-types';
import { CreateLocalizacaoDto } from './create-localizacao.dto';
import { IsEAN, IsNumber, IsOptional, IsString, Length } from 'class-validator';

// function MedidaDecimal() {
//   return applyDecorators(
//     IsOptional(),
//     Transform(({ value }: { value: string }) => parseFloat(value)),
//     IsNumber({ maxDecimalPlaces: 2 }),
//     Min(0),
//   );
// }

export class UpdateLocalizacaoDto extends PartialType(CreateLocalizacaoDto) {
  @IsOptional()
  @IsString()
  @IsEAN()
  @Length(13, 13, { message: 'O EAN deve ter 13 caracteres' })
  ean?: string;

  // Agrupamento pode ser removido passando null
  @IsOptional()
  @IsNumber()
  agrupamento_id?: number;
}
