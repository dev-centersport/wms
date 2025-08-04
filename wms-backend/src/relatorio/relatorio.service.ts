import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Auditoria,
  StatusAuditoria,
} from 'src/auditoria/entities/auditoria.entity';
import { Localizacao } from 'src/localizacao/entities/localizacao.entity';
import { Produto } from 'src/produto/entities/produto.entity';
import { ProdutoEstoque } from 'src/produto_estoque/entities/produto_estoque.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RelatorioService {
  constructor(
    @InjectRepository(ProdutoEstoque)
    private readonly ProdutoEstoqueRepository: Repository<ProdutoEstoque>,
    @InjectRepository(Produto)
    private readonly ProdutoRepository: Repository<Produto>,
    @InjectRepository(Localizacao)
    private readonly LocalizacaoRepository: Repository<Localizacao>,
    @InjectRepository(Auditoria)
    private readonly AuditoriaRepository: Repository<Auditoria>,
  ) {}

  async gerarConsulta(): Promise<any> {
    const produto_estoque = await this.ProdutoEstoqueRepository.find({
      relations: ['produto', 'localizacao.tipo', 'localizacao.armazem'],
    });

    if (!produto_estoque || produto_estoque.length === 0)
      throw new NotFoundException('Nenhum prodtuo no estoque foi encontrado!');

    const result = produto_estoque.map((item) => {
      if (item.quantidade <= 0) {
        return;
      } else {
        return {
          localizacao: {
            armazem_id: item.localizacao.armazem.armazem_id,
            armazem: item.localizacao.armazem.nome,
            localizacao_id: item.localizacao.localizacao_id,
            nome: item.localizacao.nome,
            ean: item.localizacao.ean,
            tipo: item.localizacao.tipo.tipo,
          },
          produto: {
            id_tiny: item.produto.id_tiny,
            produto_id: item.produto.produto_id,
            descricao: item.produto.descricao,
            sku: item.produto.sku,
            ean: item.produto.ean,
          },
          quantidade: item.quantidade,
        };
      }
    });

    return result;
  }

  async gerarInventario(): Promise<any> {
    // Busca todos os produtos
    const produtos = await this.ProdutoRepository.find();
    if (!produtos || produtos.length === 0)
      throw new NotFoundException('Nenhum produto cadastrado foi encontrado!');

    // Busca todos os produtos com estoque e suas relações
    const produtosComEstoque = await this.ProdutoEstoqueRepository.find({
      relations: ['produto', 'localizacao.tipo', 'localizacao.armazem'],
    });

    // Mapeia todos os produtos, combinando com informações de estoque quando existirem
    const result = produtos.map((produto) => {
      // Encontra o estoque correspondente a este produto (se existir)
      const estoqueDoProduto = produtosComEstoque.find(
        (pe) => pe.produto.produto_id === produto.produto_id,
      );

      // Se não houver estoque, retorna o produto com quantidade zero e campos vazios
      if (!estoqueDoProduto) {
        return {
          produto: {
            id_tiny: produto.id_tiny,
            produto_id: produto.produto_id,
            descricao: produto.descricao,
            sku: produto.sku,
            ean: produto.ean,
          },
          quantidade: 0,
        };
      }

      // Se houver estoque, retorna com todas as informações
      return {
        produto: {
          id_tiny: produto.id_tiny,
          produto_id: produto.produto_id,
          descricao: produto.descricao,
          sku: produto.sku,
          ean: produto.ean,
        },
        quantidade: estoqueDoProduto.quantidade,
      };
    });

    return result;
  }

  async gerarRelatorioAuditoria(): Promise<any> {
    const auditoria = await this.AuditoriaRepository.find();

    if (!auditoria || auditoria.length === 0)
      throw new NotFoundException('Não foi encontrada nenhuma auditoria');

    const auditoriasPendentes: Auditoria[] = [];
    const auditoriasEmAndamento: Auditoria[] = [];
    const auditoriasCanceladas: Auditoria[] = [];
    const auditoriasConcluidas: Auditoria[] = [];

    auditoria.map((a) => {
      if (a.status === StatusAuditoria.PENDENTE) {
        auditoriasPendentes.push(a);
      }
      if (a.status === StatusAuditoria.EM_ANDAMENTO) {
        auditoriasEmAndamento.push(a);
      }
      if (a.status === StatusAuditoria.CANCELADA) {
        auditoriasCanceladas.push(a);
      }
      if (a.status === StatusAuditoria.CONCLUIDA) {
        auditoriasConcluidas.push(a);
      }
    });

    return {
      auditoriasPendentes: auditoriasPendentes,
      auditoriasEmAndamento: auditoriasEmAndamento,
      auditoriasCanceladas: auditoriasCanceladas,
      auditoriasConcluidas: auditoriasConcluidas,
    };
  }

  async gerarReposicao(): Promise<any[]> {
    // 1. Buscar todos os estoques com relações necessárias
    const estoques = await this.ProdutoEstoqueRepository.find({
      relations: ['produto', 'localizacao', 'localizacao.armazem'],
    });

    // 2. Agrupar por produto
    const produtosMap = new Map<number, any>();

    for (const estoque of estoques) {
      const produtoId = estoque.produto.produto_id;
      const produtoNome = estoque.produto.descricao;
      const armazemNome = estoque.localizacao.armazem.nome;
      const quantidade = estoque.quantidade;

      if (!produtosMap.has(produtoId)) {
        produtosMap.set(produtoId, {
          produtoId,
          produtoNome,
          saldoDibJorge: null,
          reposicaoPossivel: [],
        });
      }

      const produtoData = produtosMap.get(produtoId);

      if (armazemNome.toLowerCase() === 'dib jorge') {
        produtoData.saldoDibJorge = quantidade;
      } else {
        produtoData.reposicaoPossivel.push({
          armazem: armazemNome,
          saldo: quantidade,
        });
      }
    }

    // 3. Filtrar produtos com saldo em Dib Jorge < 10
    const reposicoes = [];
    for (const produto of produtosMap.values()) {
      if (produto.saldoDibJorge !== null && produto.saldoDibJorge < 10) {
        reposicoes.push(produto);
      }
    }

    return reposicoes;
  }
}
