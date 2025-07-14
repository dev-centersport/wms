import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class SeparacaoUploadDTO {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => (value ? Number(value) : undefined))
  armazemPrioritarioId?: number;
}

export class ResultadoSeparacaoDTO {
  localizacoes: Array<{
    armazem: Array<{ armazemID: number; armazem: string }>;
    localizacao: string;
    produtoSKU: string;
    quantidadeSeparada: number;
    pedidosAtendidos: Array<{
      pedidoId: string | number;
      numeroPedido: string | number;
    }>;
  }>;
  produtosNaoEncontrados: string[];
}
