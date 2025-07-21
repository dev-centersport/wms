import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProdutoEstoqueDto } from './dto/create-produto_estoque.dto';
import { UpdateProdutoEstoqueDto } from './dto/update-produto_estoque.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProdutoEstoque } from './entities/produto_estoque.entity';
import { Repository } from 'typeorm';
import { Produto } from 'src/produto/entities/produto.entity';
import { Localizacao } from 'src/localizacao/entities/localizacao.entity';

@Injectable()
export class ProdutoEstoqueService {
  constructor(
    @InjectRepository(ProdutoEstoque)
    private readonly ProdutoEstoqueRepository: Repository<ProdutoEstoque>,
    @InjectRepository(Produto)
    private readonly ProdutoRepository: Repository<Produto>,
    @InjectRepository(Localizacao)
    private readonly LocalizacaoRepository: Repository<Localizacao>,
  ) {}

  async search(
    search?: string,
    offset = 0,
    limit = 50,
    armazemId?: number,
  ): Promise<{ results: ProdutoEstoque[]; total: number }> {
    const query = this.ProdutoEstoqueRepository.createQueryBuilder('pe')
      .leftJoinAndSelect('pe.produto', 'produto')
      .leftJoinAndSelect('pe.localizacao', 'localizacao')
      .leftJoinAndSelect('localizacao.armazem', 'armazem')
      .leftJoinAndSelect('localizacao.tipo', 'tipo')
      .groupBy(
        'pe.produto_estoque_id, produto.produto_id, localizacao.localizacao_id, armazem.armazem_id, tipo.tipo_localizacao_id',
      );

    if (search) {
      query.andWhere('produto.descricao ILIKE :search', {
        search: `%${search}%`,
      });
    }

    if (armazemId) {
      query.andWhere('localizacao.armazem.armazem_id = :armazemId', {
        armazemId,
      });
    }

    // Total para paginação
    const total = await query.getCount();

    // Paginação e ordenação
    query.addOrderBy('produto.descricao', 'ASC').offset(offset).limit(limit);

    const { entities } = await query.getRawAndEntities();

    const results = entities.map((produtoEstoque) => produtoEstoque);

    return { results, total };
  }

  async findOne(produto_estoque_id: number): Promise<ProdutoEstoque> {
    const produto_estoque = await this.ProdutoEstoqueRepository.findOne({
      where: { produto_estoque_id },
      relations: ['produto', 'localizacao'],
    });

    if (!produto_estoque)
      throw new NotFoundException(
        `Produto estoque com ID ${produto_estoque_id} não encontrado`,
      );

    return produto_estoque;
  }

  async create(
    createProdutoEstoqueDto: CreateProdutoEstoqueDto,
  ): Promise<ProdutoEstoque> {
    const [produto, localizacao] = await Promise.all([
      this.ProdutoRepository.findOne({
        where: { produto_id: createProdutoEstoqueDto.produto_id },
      }),
      this.LocalizacaoRepository.findOne({
        where: { localizacao_id: createProdutoEstoqueDto.localizacao_id },
      }),
    ]);

    if (!produto) throw new NotFoundException('Produto não encontrado');
    if (!localizacao) throw new NotFoundException('Localizacao não encontrado');

    // Verifica se já existe um registro para este produto e localização
    const produtoEstoqueExistente = await this.ProdutoEstoqueRepository.findOne(
      {
        where: {
          localizacao: {
            localizacao_id: createProdutoEstoqueDto.localizacao_id,
          },
          produto: { produto_id: createProdutoEstoqueDto.produto_id },
        },
        relations: ['localizacao', 'localizacao.armazem'],
      },
    );

    let produto_estoque: ProdutoEstoque;

    if (produtoEstoqueExistente) {
      // Se existir, atualiza a quantidade
      produtoEstoqueExistente.quantidade += createProdutoEstoqueDto.quantidade;
      produto_estoque = produtoEstoqueExistente;
    } else {
      // Se não existir, cria um novo registro
      produto_estoque = this.ProdutoEstoqueRepository.create({
        ...createProdutoEstoqueDto,
        produto,
        localizacao,
      });
    }

    return await this.ProdutoEstoqueRepository.save(produto_estoque);
  }

  async update(
    produto_estoque_id: number,
    updateProdutoEstoqueDto: UpdateProdutoEstoqueDto,
  ): Promise<ProdutoEstoque> {
    const produtoEstoque = await this.findOne(produto_estoque_id);
    if (!produtoEstoque) {
      throw new NotFoundException('Produto estoque não encontrado!');
    }

    // Atualiza as relações se necessário
    if (updateProdutoEstoqueDto.produto_id !== undefined) {
      const produto = await this.ProdutoRepository.findOneBy({
        produto_id: updateProdutoEstoqueDto.produto_id,
      });
      if (!produto) throw new NotFoundException('Produto não encontrado');
      produtoEstoque.produto = produto;
    }

    if (updateProdutoEstoqueDto.localizacao_id !== undefined) {
      const localizacao = await this.LocalizacaoRepository.findOneBy({
        localizacao_id: updateProdutoEstoqueDto.localizacao_id,
      });
      if (!localizacao)
        throw new NotFoundException('Localização não encontrada');
      produtoEstoque.localizacao = localizacao;
    }

    // Atualiza os campos simples (quantidade, etc.)
    const { produto_id, localizacao_id, ...camposSimples } =
      updateProdutoEstoqueDto;
    Object.assign(produtoEstoque, camposSimples);

    return await this.ProdutoEstoqueRepository.save(produtoEstoque);
  }

  async remove(produto_estoque_id: number): Promise<void> {
    const produto_estoque = await this.findOne(produto_estoque_id);

    await this.ProdutoEstoqueRepository.remove(produto_estoque);
  }
  // create(createProdutoEstoqueDto: CreateProdutoEstoqueDto) {
  //   return 'This action adds a new produtoEstoque';
  // }
  // findAll() {
  //   return `This action returns all produtoEstoque`;
  // }
  // findOne(id: number) {
  //   return `This action returns a #${id} produtoEstoque`;
  // }
  // update(id: number, updateProdutoEstoqueDto: UpdateProdutoEstoqueDto) {
  //   return `This action updates a #${id} produtoEstoque`;
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} produtoEstoque`;
  // }
}
