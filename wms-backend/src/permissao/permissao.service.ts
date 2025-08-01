import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePermissaoDto } from './dto/create-permissao.dto';
import { UpdatePermissaoDto } from './dto/update-permissao.dto';
import { Permissao, Modulo } from './entities/permissao.entity';

@Injectable()
export class PermissaoService {
  constructor(
    @InjectRepository(Permissao)
    private readonly permissaoRepository: Repository<Permissao>,
  ) {}

  async create(createPermissaoDto: CreatePermissaoDto): Promise<Permissao> {
    const permissao = this.permissaoRepository.create(createPermissaoDto);
    return await this.permissaoRepository.save(permissao);
  }

  async findAll(): Promise<Permissao[]> {
    return await this.permissaoRepository.find();
  }

  async findOne(permissao_id: number): Promise<Permissao> {
    const permissao = await this.permissaoRepository.findOne({
      where: { permissao_id },
    });

    if (!permissao) {
      throw new NotFoundException(
        `Permissão com ID ${permissao_id} não encontrada`,
      );
    }

    return permissao;
  }

  async findByModulo(modulo: Modulo): Promise<Permissao[]> {
    return await this.permissaoRepository.find({
      where: { modulo },
    });
  }

  async update(
    permissao_id: number,
    updatePermissaoDto: UpdatePermissaoDto,
  ): Promise<Permissao> {
    const permissao = await this.findOne(permissao_id);

    Object.assign(permissao, updatePermissaoDto);
    return await this.permissaoRepository.save(permissao);
  }

  async remove(permissao_id: number): Promise<void> {
    const permissao = await this.findOne(permissao_id);
    await this.permissaoRepository.remove(permissao);
  }

  // Método para criar permissões padrão para todos os módulos
  async criarPermissoesPadrao(): Promise<Permissao[]> {
    const modulos = Object.values(Modulo);
    const permissoes: Permissao[] = [];

    for (const modulo of modulos) {
      const permissaoExistente = await this.permissaoRepository.findOne({
        where: { modulo },
      });

      if (!permissaoExistente) {
        const novaPermissao = this.permissaoRepository.create({
          modulo,
          pode_incluir: false,
          pode_editar: false,
          pode_excluir: false,
        });
        const permissaoSalva =
          await this.permissaoRepository.save(novaPermissao);
        permissoes.push(permissaoSalva);
      }
    }

    return permissoes;
  }
}
