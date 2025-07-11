import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Produto } from 'src/produto/entities/produto.entity';
import { ProdutoEstoque } from 'src/produto_estoque/entities/produto_estoque.entity';
import { Localizacao } from 'src/localizacao/entities/localizacao.entity';
import { ResultadoSeparacaoDTO } from './dto/separacao.dto.';

// Definir uma interface para os dados lidos do Excel
interface ExcelRow {
  sku: string;
  [key: string]: any; // Para permitir outras propriedades que possam existir no Excel
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
    armazemPrioritario_id: number,
  ): Promise<ResultadoSeparacaoDTO> {
    // Ler o arquivo Excel
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const workbook = XLSX.read(arquivo.buffer);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const dados: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

    // Extrair SKUs do arquivo
    const skus = dados.map((item) => item.sku).filter((sku) => sku);
    const skusUnicos = [...new Set(skus)];

    // Resultados
    const resultado: ResultadoSeparacaoDTO = {
      localizacoes: [],
      produtosNaoEncontrados: [],
    };

    // Processar cada SKU
    for (const sku of skusUnicos) {
      const quantidadeNecessaria = dados.filter(
        (item) => item.sku === sku,
      ).length;

      // Encontrar produto
      // Usando produto_id conforme a entidade Produto
      const produto = await this.produtoRepository.findOne({ where: { sku } });
      if (!produto) {
        resultado.produtosNaoEncontrados.push(sku);
        continue;
      }

      // Buscar estoques prioritários primeiro
      const estoques = await this.produtoEstoqueRepository
        .createQueryBuilder('pe')
        .innerJoinAndSelect('pe.localizacao', 'localizacao')
        .where('pe.produto_produto_id = :produto_id', {
          produto_id: produto.produto_id,
        }) // Corrigido para produto_produto_id
        .andWhere('pe.quantidade > 0')
        .orderBy(
          'CASE WHEN localizacao.armazem_armazem_id = :armazem_id THEN 0 ELSE 1 END', // Corrigido para armazem_armazem_id
          'ASC',
        )
        .addOrderBy('pe.quantidade', 'DESC')
        .setParameters({ armazem_id: armazemPrioritario_id })
        .getMany();

      let quantidadeSeparada = 0;

      // Processar estoques disponíveis
      for (const estoque of estoques) {
        if (quantidadeSeparada >= quantidadeNecessaria) break;

        const quantidadeDisponivel = estoque.quantidade;
        const quantidadeASeparar = Math.min(
          quantidadeNecessaria - quantidadeSeparada,
          quantidadeDisponivel,
        );

        // Atualizar estoque com transaction para evitar race conditions
        await this.produtoEstoqueRepository.manager.transaction(
          async (manager) => {
            const estoqueAtual = await manager.findOne(ProdutoEstoque, {
              where: { produto_estoque_id: estoque.produto_estoque_id }, // Corrigido para produto_estoque_id
              lock: { mode: 'pessimistic_write' },
            });

            if (!estoqueAtual) {
              // Tratar caso onde o estoque não é encontrado (ex: removido por outra transação)
              return;
            }

            if (estoqueAtual.quantidade >= quantidadeASeparar) {
              estoqueAtual.quantidade -= quantidadeASeparar;
              await manager.save(estoqueAtual);

              // Adicionar ao resultado
              // Acessando o ID da localização através da relação 'localizacao'
              const localizacao = await manager.findOne(Localizacao, {
                where: { localizacao_id: estoque.localizacao.localizacao_id }, // Corrigido para localizacao.localizacao_id
              });

              if (localizacao) {
                resultado.localizacoes.push({
                  armazemId: localizacao.armazem.armazem_id, // Corrigido para armazemId e armazem.armazem_id
                  localizacao: localizacao.nome, // Usando localizacao.nome para o código da localização
                  produtoSKU: sku,
                  quantidadeSeparada: quantidadeASeparar,
                });
              } else {
                console.warn(
                  `Localização com ID ${estoque.localizacao.localizacao_id} não encontrada para o estoque ${estoque.produto_estoque_id}`,
                );
              }

              quantidadeSeparada += quantidadeASeparar;
            }
          },
        );
      }

      // Verificar se não conseguiu separar tudo
      if (quantidadeSeparada < quantidadeNecessaria) {
        resultado.produtosNaoEncontrados.push(
          `${sku} (faltam ${quantidadeNecessaria - quantidadeSeparada} unidades)`,
        );
      }
    }

    return resultado;
  }
}
