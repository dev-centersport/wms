import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TipoLocalizacao } from './entities/tipo_localizacao.entity';
import { Repository } from 'typeorm';
import { CreateTipoLocalizacaoDto } from './dto/create-tipo_localizacao.dto';
import { UpdateTipoLocalizacaoDto } from './dto/update-tipo_localizacao.dto';

@Injectable()
export class TipoLocalizacaoService {
  constructor(
    @InjectRepository(TipoLocalizacao)
    private readonly tipoLocalizacaoRepository: Repository<TipoLocalizacao>,
  ) {}

  async findAll(): Promise<TipoLocalizacao[]> {
    return await this.tipoLocalizacaoRepository.find();
  }

  async findOne(tipo_localizacao_id: number): Promise<TipoLocalizacao> {
    const tipo_localizacao = await this.tipoLocalizacaoRepository.findOneBy({
      tipo_localizacao_id,
    });

    if (!tipo_localizacao) {
      throw new NotFoundException(
        `Armazém com ID ${tipo_localizacao_id} não encontrado`,
      );
    }

    return tipo_localizacao;
  }

  async create(
    createTipoLocalizacaoDto: CreateTipoLocalizacaoDto,
  ): Promise<TipoLocalizacao> {
    const tipo_localizacao = this.tipoLocalizacaoRepository.create(
      createTipoLocalizacaoDto,
    );

    return await this.tipoLocalizacaoRepository.save(tipo_localizacao);
  }

  async update(
    tipo_localizacao_id: number,
    updateTipoLocalizacaoDto: UpdateTipoLocalizacaoDto,
  ): Promise<TipoLocalizacao> {
    const tipo = await this.findOne(tipo_localizacao_id);

    this.tipoLocalizacaoRepository.merge(tipo, updateTipoLocalizacaoDto);

    return await this.tipoLocalizacaoRepository.save(tipo);
  }

  async remove(tipo_localizacao_id: number): Promise<void> {
    const tipo = await this.findOne(tipo_localizacao_id);

    await this.tipoLocalizacaoRepository.remove(tipo);
  }
}
