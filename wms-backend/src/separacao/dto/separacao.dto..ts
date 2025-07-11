import { IsNotEmpty, IsNumber } from 'class-validator';

export class SeparacaoUploadDTO {
  @IsNotEmpty()
  @IsNumber()
  armazemPrioritarioId: number;
}

export class ResultadoSeparacaoDTO {
  localizacoes: {
    armazemId: number;
    localizacao: string;
    produtoSKU: string;
    quantidadeSeparada: number;
  }[];
  produtosNaoEncontrados: string[];
}
