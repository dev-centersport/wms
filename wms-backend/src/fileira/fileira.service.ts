import { Injectable } from '@nestjs/common';
import { CreateFileiraDto } from './dto/create-fileira.dto';
import { UpdateFileiraDto } from './dto/update-fileira.dto';

@Injectable()
export class FileiraService {
  create(createFileiraDto: CreateFileiraDto) {
    return 'This action adds a new fileira';
  }

  findAll() {
    return `This action returns all fileira`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fileira`;
  }

  update(id: number, updateFileiraDto: UpdateFileiraDto) {
    return `This action updates a #${id} fileira`;
  }

  remove(id: number) {
    return `This action removes a #${id} fileira`;
  }
}
