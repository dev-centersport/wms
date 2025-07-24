import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { Perfil } from 'src/perfil/entities/perfil.entity';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly UsuarioRepository: Repository<Usuario>,
    @InjectRepository(Perfil)
    private readonly PerfilRepository: Repository<Perfil>,
  ) {}

  async findAll(): Promise<Usuario[]> {
    return await this.UsuarioRepository.find({
      relations: ['perfil'],
    });
  }

  async findOne(usuario_id: number): Promise<Usuario> {
    const usuario = await this.UsuarioRepository.findOne({
      where: { usuario_id },
      relations: ['usuario'],
    });

    if (!usuario)
      throw new NotFoundException(
        `Usuário com o ID ${usuario_id} não encontrado`,
      );

    return usuario;
  }

  async create(CreateUsuarioDto: CreateUsuarioDto): Promise<Usuario> {
    const perfil = await this.PerfilRepository.findOne({
      where: { perfil_id: CreateUsuarioDto.perfil_id },
    });

    if (!perfil)
      throw new NotFoundException('Perfil de usuário não encontrado');

    const usuario = this.UsuarioRepository.create({
      ...CreateUsuarioDto,
      perfil,
    });

    return await this.UsuarioRepository.save(usuario);
  }

  async validarUsuario(
    usuario: string,
    senha: string,
  ): Promise<{ status: number; message: string }> {
    const usuarioEncontrado = await this.UsuarioRepository.findOne({
      where: { usuario: usuario },
    });

    if (!usuarioEncontrado)
      return {
        status: HttpStatus.NOT_FOUND,
        message: 'Usuário não encontrado',
      };

    const validacao = usuarioEncontrado.senha === senha;

    if (!validacao)
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Senha inválida',
      };

    return {
      status: HttpStatus.OK,
      message: 'Usuário logado com sucesso',
    };
  }

  async update(
    usuario_id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Usuario> {
    const usuario = await this.findOne(usuario_id);

    if (!usuario) throw new NotFoundException('Usuário não encontrado');

    if (updateUsuarioDto.perfil_id !== undefined) {
      const perfil = await this.PerfilRepository.findOneBy({
        perfil_id: updateUsuarioDto.perfil_id,
      });
      if (!perfil) throw new NotFoundException('Perfil não encontrado');
    }

    const { perfil_id, ...camposSimpels } = updateUsuarioDto;

    Object.assign(usuario, camposSimpels);

    return await this.UsuarioRepository.save(usuario);
  }

  async remove(usuario_id: number): Promise<void> {
    const usuario = await this.findOne(usuario_id);

    await this.UsuarioRepository.remove(usuario);
  }

  //   create(createUsuarioDto: CreateUsuarioDto) {
  //     return 'This action adds a new usuario';
  //   }
  //   findAll() {
  //     return `This action returns all usuario`;
  //   }
  //   findOne(id: number) {
  //     return `This action returns a #${id} usuario`;
  //   }
  //   update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
  //     return `This action updates a #${id} usuario`;
  //   }
  //   remove(id: number) {
  //     return `This action removes a #${id} usuario`;
  //   }
}
