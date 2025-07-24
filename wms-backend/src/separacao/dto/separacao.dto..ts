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
    urlFoto: string | null;
    descricao: string;
    // produtoSKU: string;
    eanProduto: string | null;
    armazem: string;
    localizacao: string;
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
      // idItem: string | number;
      urlFoto: string;
      descricao: string;
      sku: string;
      ean: string;
      localizacoes: Array<{
        armazem: string;
        localizacao: string;
        quantidadeSeparada: number;
      }>;
    }>;
    completo: boolean;
  }>;
  // produtosNaoEncontrados: string[];
}
