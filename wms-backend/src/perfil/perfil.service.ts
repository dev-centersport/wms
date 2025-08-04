import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Perfil } from './entities/perfil.entity';
import { Repository } from 'typeorm';
import { Permissao } from '../permissao/entities/permissao.entity';

@Injectable()
export class PerfilService {
  constructor(
    @InjectRepository(Perfil)
    private readonly PerfilRepository: Repository<Perfil>,
    @InjectRepository(Permissao)
    private readonly permissaoRepository: Repository<Permissao>,
  ) {}

  async findAll(): Promise<Perfil[]> {
    return await this.PerfilRepository.find({
      relations: ['permissoes'],
    });
  }

  async findOne(perfil_id: number): Promise<Perfil> {
    const perfil = await this.PerfilRepository.findOne({
      where: { perfil_id },
      relations: ['permissoes'],
    });

    if (!perfil)
      throw new NotFoundException(`Perfil com ID ${perfil_id} não encontrado`);

    return perfil;
  }

  async create(CreatePerfilDto: CreatePerfilDto): Promise<Perfil> {
    const perfil = this.PerfilRepository.create({
      ...CreatePerfilDto,
    });

    return await this.PerfilRepository.save(perfil);
  }

  async update(
    perfil_id: number,
    updatePerfilDto: UpdatePerfilDto,
  ): Promise<Perfil> {
    const perfil = await this.findOne(perfil_id);

    if (!perfil) throw new NotFoundException('Perfil não encontrado');

    const { ...camposSimples } = updatePerfilDto;
    Object.assign(perfil, camposSimples);

    return await this.PerfilRepository.save(perfil);
  }

  async remove(perfil_id: number): Promise<void> {
    const perfil = await this.findOne(perfil_id);

    await this.PerfilRepository.remove(perfil);
  }

  // Método para adicionar permissões ao perfil
  async adicionarPermissoes(
    perfil_id: number,
    permissao_ids: number[],
  ): Promise<Perfil> {
    const perfil = await this.findOne(perfil_id);
    const permissoes = await this.permissaoRepository
      .createQueryBuilder('permissao')
      .where('permissao.permissao_id IN (:...ids)', { ids: permissao_ids })
      .getMany();

    perfil.permissoes = [...(perfil.permissoes || []), ...permissoes];
    return await this.PerfilRepository.save(perfil);
  }

  // Método para remover permissões do perfil
  async removerPermissoes(
    perfil_id: number,
    permissao_ids: number[],
  ): Promise<Perfil> {
    const perfil = await this.findOne(perfil_id);

    perfil.permissoes = perfil.permissoes.filter(
      (p) => !permissao_ids.includes(p.permissao_id),
    );

    return await this.PerfilRepository.save(perfil);
  }

  // Método para definir permissões do perfil (substitui todas)
  async definirPermissoes(
    perfil_id: number,
    permissao_ids: number[],
  ): Promise<Perfil> {
    const perfil = await this.findOne(perfil_id);
    const permissoes = await this.permissaoRepository
      .createQueryBuilder('permissao')
      .where('permissao.permissao_id IN (:...ids)', { ids: permissao_ids })
      .getMany();

    perfil.permissoes = permissoes;
    return await this.PerfilRepository.save(perfil);
  }
}
