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
    const produto_estoque = await this.ProdutoEstoqueRepository.find({
      relations: ['produto', 'localizacao.tipo', 'localizacao.armazem'],
    });
    console.log(produto_estoque);

    if (!produto_estoque)
      throw new NotFoundException('Nenhum prodtuo no estoque foi encontrado!');

    const result = produto_estoque.map((item) => ({
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
    }));

    return result;
  }
}
