import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Produto } from 'src/produto/entities/produto.entity';
import { idRelations } from 'src/utils/decorator.id.relations';

class ItensLocalizacaoDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Produto)
  produto: Produto;
}

class LocalizacaoDto {
  @idRelations()
  localizacao_id: number;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItensLocalizacaoDto)
  itens_localizacao: ItensLocalizacaoDto[];
}

export class LocalizacoesProximasDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @ValidateNested({ each: true })
  @Type(() => LocalizacaoDto)
  localizacoes_proximas: LocalizacaoDto[];
}
