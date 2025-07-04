import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateProdutoEstoqueDto {
  @IsNumber()
  @IsNotEmpty()
  quantidade: number;

  @IsNumber()
  @IsNotEmpty()
  produto_id: number;

  @IsNumber()
  @IsNotEmpty()
  localizacao_id: number;
}
