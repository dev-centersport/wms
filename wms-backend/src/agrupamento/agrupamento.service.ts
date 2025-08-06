import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAgrupamentoDto } from './dto/create-agrupamento.dto';
import { UpdateAgrupamentoDto } from './dto/update-agrupamento.dto';
import { Agrupamento } from './entities/agrupamento.entity';
import { Fileira } from 'src/fileira/entities/fileira.entity';

@Injectable()
export class AgrupamentoService {
  constructor(
    @InjectRepository(Agrupamento)
    private readonly agrupamentoRepository: Repository<Agrupamento>,
    @InjectRepository(Fileira)
    private readonly fileiraRepository: Repository<Fileira>,
  ) {}

  async create(
    createAgrupamentoDto: CreateAgrupamentoDto,
  ): Promise<Agrupamento> {
    const agrupamento = this.agrupamentoRepository.create({
      nome: createAgrupamentoDto.nome,
      geom: createAgrupamentoDto.geom,
    });

    // Se foi informado fileira_id, busca e associa a fileira
    if (createAgrupamentoDto.fileira_id) {
      const fileira = await this.fileiraRepository.findOneBy({
        fileira_id: createAgrupamentoDto.fileira_id,
      });

      if (!fileira) {
        throw new NotFoundException(
          `Fileira com ID ${createAgrupamentoDto.fileira_id} não encontrada`,
        );
      }

      agrupamento.fileira = fileira;
    }

    return await this.agrupamentoRepository.save(agrupamento);
  }

  async findAll(): Promise<Agrupamento[]> {
    return await this.agrupamentoRepository.find({
      relations: ['fileira', 'localizacoes'],
    });
  }

  async findOne(agrupamento_id: number): Promise<Agrupamento> {
    const agrupamento = await this.agrupamentoRepository.findOne({
      where: { agrupamento_id },
      relations: ['fileira', 'localizacoes'],
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

    // Se foi informado fileira_id, busca e associa a nova fileira
    if (updateAgrupamentoDto.fileira_id) {
      const fileira = await this.fileiraRepository.findOneBy({
        fileira_id: updateAgrupamentoDto.fileira_id,
      });

      if (!fileira) {
        throw new NotFoundException(
          `Fileira com ID ${updateAgrupamentoDto.fileira_id} não encontrada`,
        );
      }

      agrupamento.fileira = fileira;
    }

    this.agrupamentoRepository.merge(agrupamento, updateAgrupamentoDto);

    return await this.agrupamentoRepository.save(agrupamento);
  }

  async remove(agrupamento_id: number): Promise<void> {
    const agrupamento = await this.findOne(agrupamento_id);
    await this.agrupamentoRepository.remove(agrupamento);
  }
}
