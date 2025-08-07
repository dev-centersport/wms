import { Injectable } from '@nestjs/common';
import { CreateLadoDto } from './dto/create-lado.dto';
import { UpdateLadoDto } from './dto/update-lado.dto';

@Injectable()
export class LadoService {
  create(createLadoDto: CreateLadoDto) {
    return 'This action adds a new lado';
  }

  findAll() {
    return `This action returns all lado`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lado`;
  }

  update(id: number, updateLadoDto: UpdateLadoDto) {
    return `This action updates a #${id} lado`;
  }

  remove(id: number) {
    return `This action removes a #${id} lado`;
  }
}
