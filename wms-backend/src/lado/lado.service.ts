import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLadoDto } from './dto/create-lado.dto';
import { UpdateLadoDto } from './dto/update-lado.dto';
import { Lado } from './entities/lado.entity';

@Injectable()
export class LadoService {
  constructor(
    @InjectRepository(Lado)
    private readonly ladoRepository: Repository<Lado>,
  ) {}

  async create(createLadoDto: CreateLadoDto): Promise<Lado> {
    const lado = this.ladoRepository.create(createLadoDto);
    return await this.ladoRepository.save(lado);
  }

  async findAll(): Promise<Lado[]> {
    return await this.ladoRepository.find({
      relations: ['fileira', 'agrupamentos'],
    });
  }

  async findOne(id: number): Promise<Lado> {
    const lado = await this.ladoRepository.findOne({
      where: { lado_id: id },
      relations: ['fileira', 'agrupamentos'],
    });

    if (!lado) {
      throw new NotFoundException(`Lado com ID ${id} não encontrado`);
    }

    return lado;
  }

  async update(id: number, updateLadoDto: UpdateLadoDto): Promise<Lado> {
    const lado = await this.findOne(id);

    Object.assign(lado, updateLadoDto);
    return await this.ladoRepository.save(lado);
  }

  async remove(id: number): Promise<void> {
    const lado = await this.findOne(id);
    await this.ladoRepository.remove(lado);
  }
}
