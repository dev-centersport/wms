import { Injectable } from '@nestjs/common';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';
import { UpdateMovimentacaoDto } from './dto/update-movimentacao.dto';

@Injectable()
export class MovimentacaoService {
  create(createMovimentacaoDto: CreateMovimentacaoDto) {
    return 'This action adds a new movimentacao';
  }

  findAll() {
    return `This action returns all movimentacao`;
  }

  findOne(id: number) {
    return `This action returns a #${id} movimentacao`;
  }

  update(id: number, updateMovimentacaoDto: UpdateMovimentacaoDto) {
    return `This action updates a #${id} movimentacao`;
  }

  remove(id: number) {
    return `This action removes a #${id} movimentacao`;
  }
}
