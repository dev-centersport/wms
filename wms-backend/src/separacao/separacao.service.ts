import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Produto } from 'src/produto/entities/produto.entity';
import { ProdutoEstoque } from 'src/produto_estoque/entities/produto_estoque.entity';
import { Localizacao } from 'src/localizacao/entities/localizacao.entity';
import {
  ResultadoSeparacaoDTO,
  ResultadoSeparacaoPorPedidoDTO,
} from './dto/separacao.dto.';

interface ExcelRow {
  'Código (SKU)': string;
  ID: string | number;
  'Número do pedido': string | number;
  [key: string]: any;
}

@Injectable()
export class SeparacaoService {
  constructor(
    @InjectRepository(Produto)
    private produtoRepository: Repository<Produto>,
    @InjectRepository(ProdutoEstoque)
    private produtoEstoqueRepository: Repository<ProdutoEstoque>,
    @InjectRepository(Localizacao)
    private localizacaoRepository: Repository<Localizacao>,
  ) {}

  async processarSeparacao(
    arquivo: Express.Multer.File,
    armazemPrioritarioId?: number,
  ): Promise<ResultadoSeparacaoDTO> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const workbook = XLSX.read(arquivo.buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const dados: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

    const resultado: ResultadoSeparacaoDTO = {
      localizacoes: [],
      produtosNaoEncontrados: [],
    };

    // Primeiro agrupamos todos os pedidos por SKU
    const pedidosPorSku = new Map<
      string,
      Array<{
        idPedido: string | number;
        numPedido: string | number;
      }>
    >();

    for (const item of dados) {
      const sku = item['Código (SKU)'];
      if (!sku) continue;

      if (!pedidosPorSku.has(sku)) {
        pedidosPorSku.set(sku, []);
      }
      pedidosPorSku.get(sku)?.push({
        idPedido: item.ID,
        numPedido: item['Número do pedido'],
      });
    }

    // Agora processamos cada SKU único
    for (const [sku, pedidos] of pedidosPorSku.entries()) {
      const quantidadeNecessaria = pedidos.length; // Total de pedidos para este SKU
      const produto = await this.produtoRepository.findOne({ where: { sku } });

      if (!produto) {
        // Adiciona todos os pedidos que não encontraram o produto
        pedidos.forEach((pedido) => {
          resultado.produtosNaoEncontrados.push(
            `${sku} (Pedido: ${pedido.numPedido})`,
          );
        });
        continue;
      }

      // Consulta os estoques
      const estoques = await this.produtoEstoqueRepository
        .createQueryBuilder('pe')
        .innerJoinAndSelect('pe.localizacao', 'localizacao')
        .innerJoinAndSelect('localizacao.armazem', 'armazem')
        .innerJoinAndSelect('pe.produto', 'produto')
        .where('pe.produto.produto_id = :produtoId', {
          produtoId: produto.produto_id,
        })
        .andWhere('pe.quantidade > 0')
        .orderBy(
          'CASE WHEN armazem.armazem_id = :armazemId THEN 0 ELSE 1 END',
          'ASC',
        )
        .addOrderBy('localizacao.nome', 'ASC')
        .addOrderBy('pe.quantidade', 'DESC')
        .setParameter('armazemId', armazemPrioritarioId || 0)
        .getMany();

      let quantidadeSeparada = 0;
      const pedidosAtendidos: Array<{
        idPedido: string | number;
        numPedido: string | number;
      }> = [];

      for (const estoque of estoques) {
        if (quantidadeSeparada >= quantidadeNecessaria) break;

        const quantidadeDisponivel = estoque.quantidade;
        const quantidadeASeparar = Math.min(
          quantidadeNecessaria - quantidadeSeparada,
          quantidadeDisponivel,
        );

        // Adiciona ao resultado (agrupado por SKU e localização)
        const itemExistente = resultado.localizacoes.find(
          (item) =>
            item.produtoSKU === sku &&
            item.localizacao === estoque.localizacao.nome,
        );

        if (itemExistente) {
          // Se já existe um item para este SKU e localização, apenas atualiza a quantidade
          itemExistente.quantidadeSeparada += quantidadeASeparar;
          // Adiciona os pedidos atendidos
          pedidosAtendidos.push(
            ...pedidos.slice(
              quantidadeSeparada,
              quantidadeSeparada + quantidadeASeparar,
            ),
          );
        } else {
          // Cria um novo item no resultado
          resultado.localizacoes.push({
            armazem: [
              {
                armazemID: estoque.localizacao.armazem.armazem_id,
                armazem: estoque.localizacao.armazem.nome,
              },
            ],
            localizacao: estoque.localizacao.nome,
            produtoSKU: sku,
            urlFoto: estoque.produto.url_foto,
            quantidadeSeparada: quantidadeASeparar,
            // Adiciona os pedidos atendidos neste lote
            pedidosAtendidos: pedidos
              .slice(
                quantidadeSeparada,
                quantidadeSeparada + quantidadeASeparar,
              )
              .map((p) => ({
                pedidoId: p.idPedido,
                numeroPedido: p.numPedido,
              })),
          });
        }

        quantidadeSeparada += quantidadeASeparar;
      }

      // Verifica se faltou algum item
      if (quantidadeSeparada < quantidadeNecessaria) {
        const pedidosNaoAtendidos = pedidos.slice(quantidadeSeparada);
        pedidosNaoAtendidos.forEach((pedido) => {
          resultado.produtosNaoEncontrados.push(
            `${sku} (Pedido: ${pedido.numPedido}) - faltam 1 unidade`,
          );
        });
      }
    }

    return resultado;
  }

  // Agrupando por pedido
  async processarSeparacaoPorPedido(
    arquivo: Express.Multer.File,
    armazemPrioritarioId?: number,
  ): Promise<ResultadoSeparacaoPorPedidoDTO> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const workbook = XLSX.read(arquivo.buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const dados: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

    const resultado: ResultadoSeparacaoPorPedidoDTO = {
      pedidos: [],
      produtosNaoEncontrados: [],
    };

    // Primeiro agrupamos todos os itens por pedido
    const itensPorPedido = new Map<
      string | number,
      Array<{
        sku: string;
        idItem: string | number;
      }>
    >();

    for (const item of dados) {
      const numPedido = item['Número do pedido'];
      if (!numPedido) continue;

      if (!itensPorPedido.has(numPedido)) {
        itensPorPedido.set(numPedido, []);
      }
      itensPorPedido.get(numPedido)?.push({
        sku: item['Código (SKU)'],
        idItem: item.ID,
      });
    }

    // Processamos cada pedido individualmente
    for (const [numPedido, itens] of itensPorPedido.entries()) {
      const pedidoResultado = {
        numeroPedido: numPedido,
        itens: [] as Array<{
          sku: string;
          idItem: string | number;
          localizacoes: Array<{
            armazem: { armazemID: number; armazem: string };
            localizacao: string;
            quantidadeSeparada: number;
          }>;
        }>,
        completo: true,
      };

      // Processamos cada item do pedido
      for (const item of itens) {
        const produto = await this.produtoRepository.findOne({
          where: { sku: item.sku },
        });

        if (!produto) {
          resultado.produtosNaoEncontrados.push(
            `${item.sku} (Pedido: ${numPedido})`,
          );
          pedidoResultado.completo = false;
          continue;
        }

        // Consulta os estoques com prioridade para o armazém especificado
        const estoques = await this.produtoEstoqueRepository
          .createQueryBuilder('pe')
          .innerJoinAndSelect('pe.localizacao', 'localizacao')
          .innerJoinAndSelect('localizacao.armazem', 'armazem')
          .innerJoinAndSelect('pe.produto', 'produto')
          .where('pe.produto.produto_id = :produtoId', {
            produtoId: produto.produto_id,
          })
          .andWhere('pe.quantidade > 0')
          .orderBy(
            'CASE WHEN armazem.armazem_id = :armazemId THEN 0 ELSE 1 END',
            'ASC',
          )
          .addOrderBy('localizacao.nome', 'ASC')
          .addOrderBy('pe.quantidade', 'DESC')
          .setParameter('armazemId', armazemPrioritarioId || 0)
          .getMany();

        const quantidadeNecessaria = 1; // 1 unidade por item do pedido
        let quantidadeSeparada = 0;
        const localizacoesItem: Array<{
          armazem: { armazemID: number; armazem: string };
          localizacao: string;
          quantidadeSeparada: number;
        }> = [];

        for (const estoque of estoques) {
          if (quantidadeSeparada >= quantidadeNecessaria) break;

          const quantidadeDisponivel = estoque.quantidade;
          const quantidadeASeparar = Math.min(
            quantidadeNecessaria - quantidadeSeparada,
            quantidadeDisponivel,
          );

          localizacoesItem.push({
            armazem: {
              armazemID: estoque.localizacao.armazem.armazem_id,
              armazem: estoque.localizacao.armazem.nome,
            },
            localizacao: estoque.localizacao.nome,
            quantidadeSeparada: quantidadeASeparar,
          });

          quantidadeSeparada += quantidadeASeparar;
        }

        if (quantidadeSeparada < quantidadeNecessaria) {
          pedidoResultado.completo = false;
          resultado.produtosNaoEncontrados.push(
            `${item.sku} (Pedido: ${numPedido}) - faltam ${quantidadeNecessaria - quantidadeSeparada} unidades`,
          );
        }

        pedidoResultado.itens.push({
          sku: item.sku,
          idItem: item.idItem,
          localizacoes: localizacoesItem,
        });
      }

      resultado.pedidos.push(pedidoResultado);
    }

    return resultado;
  }
}
