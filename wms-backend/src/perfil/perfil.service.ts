import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Perfil } from './entities/perfil.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PerfilService {
  constructor(
    @InjectRepository(Perfil)
    private readonly PerfilRepository: Repository<Perfil>,
  ) {}

  async findAll(): Promise<Perfil[]> {
    return await this.PerfilRepository.find();
  }

  async findOne(perfil_id: number): Promise<Perfil> {
    const perfil = await this.PerfilRepository.findOne({
      where: { perfil_id },
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

  // create(createPerfilDto: CreatePerfilDto) {
  //   return 'This action adds a new perfil';
  // }
  // findAll() {
  //   return `This action returns all perfil`;
  // }
  // findOne(id: number) {
  //   return `This action returns a #${id} perfil`;
  // }
  // update(id: number, updatePerfilDto: UpdatePerfilDto) {
  //   return `This action updates a #${id} perfil`;
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} perfil`;
  // }
}
