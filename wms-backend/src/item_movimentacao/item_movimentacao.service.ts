import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemMovimentacaoDto } from './dto/create-item_movimentacao.dto';
// import { UpdateItemMovimentacaoDto } from './dto/update-item_movimentacao.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ItemMovimentacao } from './entities/item_movimentacao.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ItemMovimentacaoService {
  constructor(
    @InjectRepository(ItemMovimentacao)
    private readonly itemMovimentacaoRepository: Repository<ItemMovimentacao>,
  ) {}

  async create(CreateItemMovimentacaoDto: CreateItemMovimentacaoDto) {
    const item = this.itemMovimentacaoRepository.create(
      CreateItemMovimentacaoDto,
    );
    return await this.itemMovimentacaoRepository.save(item);
  }

  async findAll(): Promise<ItemMovimentacao[]> {
    return await this.itemMovimentacaoRepository.find({
      relations: ['movimentacao', 'produto_estoque.produto'],
    });
  }

  async findOne(item_movimentacao_id: number): Promise<ItemMovimentacao> {
    const item_movimentacao = await this.itemMovimentacaoRepository.findOne({
      where: { item_movimentacao_id },
      relations: ['movimentacao', 'produto_estoque.produto'],
    });

    if (!item_movimentacao)
      throw new NotFoundException(
        `Item movimentação com ID ${item_movimentacao_id} não encontrado`,
      );

    return item_movimentacao;
  }

  async remove(item_movimentacao_id: number): Promise<void> {
    const item_movimentacao = await this.findOne(item_movimentacao_id);

    await this.itemMovimentacaoRepository.remove(item_movimentacao);
  }
  // create(createItemMovimentacaoDto: CreateItemMovimentacaoDto) {
  //   return 'This action adds a new itemMovimentacao';
  // }
  // findAll() {
  //   return `This action returns all itemMovimentacao`;
  // }
  // findOne(id: number) {
  //   return `This action returns a #${id} itemMovimentacao`;
  // }
  // update(id: number, updateItemMovimentacaoDto: UpdateItemMovimentacaoDto) {
  //   return `This action updates a #${id} itemMovimentacao`;
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} itemMovimentacao`;
  // }
}
