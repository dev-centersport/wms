import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFileiraDto } from './dto/create-fileira.dto';
import { UpdateFileiraDto } from './dto/update-fileira.dto';
import { Fileira } from './entities/fileira.entity';

@Injectable()
export class FileiraService {
  constructor(
    @InjectRepository(Fileira)
    private readonly fileiraRepository: Repository<Fileira>,
  ) {}

  async create(createFileiraDto: CreateFileiraDto): Promise<Fileira> {
    const fileira = this.fileiraRepository.create(createFileiraDto);
    return await this.fileiraRepository.save(fileira);
  }

  async findAll(): Promise<Fileira[]> {
    return await this.fileiraRepository.find({
      relations: ['agrupamentos'],
    });
  }

  async findOne(fileira_id: number): Promise<Fileira> {
    const fileira = await this.fileiraRepository.findOne({
      where: { fileira_id },
      relations: ['agrupamentos'],
    });

    if (!fileira) {
      throw new NotFoundException(
        `Fileira com ID ${fileira_id} não encontrada`,
      );
    }

    return fileira;
  }

  async update(
    fileira_id: number,
    updateFileiraDto: UpdateFileiraDto,
  ): Promise<Fileira> {
    const fileira = await this.findOne(fileira_id);

    this.fileiraRepository.merge(fileira, updateFileiraDto);

    return await this.fileiraRepository.save(fileira);
  }

  async remove(fileira_id: number): Promise<void> {
    const fileira = await this.findOne(fileira_id);
    await this.fileiraRepository.remove(fileira);
  }
}
