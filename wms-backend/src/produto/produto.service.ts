import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Produto } from './entities/produto.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProdutoService {
  constructor(
    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
  ) {}

  async findAll() {
    return await this.produtoRepository.find();
  }

  async findOne(produto_id: number) {
    const produto = await this.produtoRepository.findOne({
      where: { produto_id },
    });

    if (!produto) {
      throw new NotFoundException(
        `Localização com ID ${produto_id} não encontrado`,
      );
    }

    return produto;
  }

  async create(createProdutoDto: CreateProdutoDto): Promise<Produto> {
    const produto = this.produtoRepository.create(createProdutoDto);

    return await this.produtoRepository.save(produto);
  }

  async update(
    produto_id: number,
    updateProdutoDto: UpdateProdutoDto,
  ): Promise<Produto> {
    const produto = await this.findOne(produto_id);

    this.produtoRepository.merge(produto, updateProdutoDto);

    return await this.produtoRepository.save(produto);
  }

  async remove(produto_id: number): Promise<void> {
    const produto = await this.findOne(produto_id);

    await this.produtoRepository.remove(produto);
  }
  // create(createProdutoDto: CreateProdutoDto) {
  //   return 'This action adds a new produto';
  // }
  // findAll() {
  //   return `This action returns all produto`;
  // }
  // findOne(id: number) {
  //   return `This action returns a #${id} produto`;
  // }
  // update(id: number, updateProdutoDto: UpdateProdutoDto) {
  //   return `This action updates a #${id} produto`;
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} produto`;
  // }
}
