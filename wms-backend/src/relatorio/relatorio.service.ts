import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
  ) {}

  async relatorioConsulta(): Promise<any> {
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
          localizacao: {
            armazem_id: null,
            armazem: null,
            localizacao_id: null,
            nome: null,
            ean: null,
            tipo: null,
          },
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
        localizacao: {
          armazem_id: estoqueDoProduto.localizacao.armazem.armazem_id,
          armazem: estoqueDoProduto.localizacao.armazem.nome,
          localizacao_id: estoqueDoProduto.localizacao.localizacao_id,
          nome: estoqueDoProduto.localizacao.nome,
          ean: estoqueDoProduto.localizacao.ean,
          tipo: estoqueDoProduto.localizacao.tipo.tipo,
        },
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
}
