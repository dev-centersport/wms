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

  async findAll(): Promise<ProdutoEstoque[]> {
    return await this.ProdutoEstoqueRepository.find({
      relations: ['produto', 'localizacao'],
    });
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

    const produto_estoque = this.ProdutoEstoqueRepository.create({
      ...createProdutoEstoqueDto,
      produto,
      localizacao,
    });

    return await this.ProdutoEstoqueRepository.save(produto_estoque);
  }

  async update(
    produto_estoque_id: number,
    UpdateProdutoEstoqueDto: UpdateProdutoEstoqueDto,
  ): Promise<ProdutoEstoque> {
    const produto_estoque = await this.findOne(produto_estoque_id);

    if (!produto_estoque)
      throw new NotFoundException('Produto estoque não encontrado!');

    if (UpdateProdutoEstoqueDto.produto_id !== undefined) {
      const produto = await this.ProdutoRepository.findOneBy({
        produto_id: UpdateProdutoEstoqueDto.produto_id,
      });
      if (!produto) throw new NotFoundException('Produto não encontrado');
    }

    if (UpdateProdutoEstoqueDto.localizacao_id !== undefined) {
      const localizacao = await this.LocalizacaoRepository.findOneBy({
        localizacao_id: UpdateProdutoEstoqueDto.localizacao_id,
      });
      if (!localizacao) throw new NotFoundException('Produto não encontrado');
    }

    const { produto_id, localizacao_id, ...camposSimpels } =
      UpdateProdutoEstoqueDto;

    Object.assign(produto_estoque, camposSimpels);

    return await this.ProdutoEstoqueRepository.save(produto_estoque);
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
