import { Injectable } from '@nestjs/common';
import { CreateAgrupamentoDto } from './dto/create-agrupamento.dto';
import { UpdateAgrupamentoDto } from './dto/update-agrupamento.dto';

@Injectable()
export class AgrupamentoService {
  create(createAgrupamentoDto: CreateAgrupamentoDto) {
    return 'This action adds a new agrupamento';
  }

  findAll() {
    return `This action returns all agrupamento`;
  }

  findOne(id: number) {
    return `This action returns a #${id} agrupamento`;
  }

  update(id: number, updateAgrupamentoDto: UpdateAgrupamentoDto) {
    return `This action updates a #${id} agrupamento`;
  }

  remove(id: number) {
    return `This action removes a #${id} agrupamento`;
  }
}
