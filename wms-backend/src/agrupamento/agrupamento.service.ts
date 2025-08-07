import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAgrupamentoDto } from './dto/create-agrupamento.dto';
import { UpdateAgrupamentoDto } from './dto/update-agrupamento.dto';
import { Agrupamento } from './entities/agrupamento.entity';
import { Lado } from 'src/lado/entities/lado.entity';

@Injectable()
export class AgrupamentoService {
  constructor(
    @InjectRepository(Agrupamento)
    private readonly agrupamentoRepository: Repository<Agrupamento>,
    @InjectRepository(Lado)
    private readonly ladoRepository: Repository<Lado>,
  ) {}

  async create(
    createAgrupamentoDto: CreateAgrupamentoDto,
  ): Promise<Agrupamento> {
    const agrupamento = this.agrupamentoRepository.create({
      nome: createAgrupamentoDto.nome,
      geom: createAgrupamentoDto.geom,
    });

    // Se foi informado lado_id, busca e associa o lado
    if (createAgrupamentoDto.lado_id) {
      const lado = await this.ladoRepository.findOneBy({
        lado_id: createAgrupamentoDto.lado_id,
      });

      if (!lado) {
        throw new NotFoundException(
          `Lado com ID ${createAgrupamentoDto.lado_id} não encontrado`,
        );
      }

      agrupamento.lado = lado;
    }

    return await this.agrupamentoRepository.save(agrupamento);
  }

  async findAll(): Promise<Agrupamento[]> {
    return await this.agrupamentoRepository.find({
      relations: ['lado', 'localizacoes'],
    });
  }

  async findOne(agrupamento_id: number): Promise<Agrupamento> {
    const agrupamento = await this.agrupamentoRepository.findOne({
      where: { agrupamento_id },
      relations: ['lado', 'localizacoes'],
    });

    if (!agrupamento) {
      throw new NotFoundException(
        `Agrupamento com ID ${agrupamento_id} não encontrado`,
      );
    }

    return agrupamento;
  }

  async update(
    agrupamento_id: number,
    updateAgrupamentoDto: UpdateAgrupamentoDto,
  ): Promise<Agrupamento> {
    const agrupamento = await this.findOne(agrupamento_id);

    // Se foi informado lado_id, busca e associa o novo lado
    if (updateAgrupamentoDto.lado_id) {
      const lado = await this.ladoRepository.findOneBy({
        lado_id: updateAgrupamentoDto.lado_id,
      });

      if (!lado) {
        throw new NotFoundException(
          `Lado com ID ${updateAgrupamentoDto.lado_id} não encontrado`,
        );
      }

      agrupamento.lado = lado;
    }

    this.agrupamentoRepository.merge(agrupamento, updateAgrupamentoDto);

    return await this.agrupamentoRepository.save(agrupamento);
  }

  async remove(agrupamento_id: number): Promise<void> {
    const agrupamento = await this.findOne(agrupamento_id);
    await this.agrupamentoRepository.remove(agrupamento);
  }
}
