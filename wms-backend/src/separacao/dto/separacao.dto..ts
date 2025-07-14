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
    urlFoto: string | null;
    quantidadeSeparada: number;
    pedidosAtendidos: Array<{
      pedidoId: string | number;
      numeroPedido: string | number;
    }>;
  }>;
  produtosNaoEncontrados: string[];
}

export class ResultadoSeparacaoPorPedidoDTO {
  pedidos: Array<{
    numeroPedido: string | number;
    itens: Array<{
      sku: string;
      idItem: string | number;
      localizacoes: Array<{
        armazem: { armazemID: number; armazem: string };
        localizacao: string;
        quantidadeSeparada: number;
      }>;
    }>;
    completo: boolean;
  }>;
  produtosNaoEncontrados: string[];
}
