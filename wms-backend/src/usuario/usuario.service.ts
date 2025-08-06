import {
  // BadRequestException,
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
import { Permissao } from 'src/permissao/entities/permissao.entity';
import { PasswordUtils } from 'src/utils/password.utils';
import { getPermissoesEfetivas } from 'src/utils/permissoes-efetivas.utils';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly UsuarioRepository: Repository<Usuario>,
    @InjectRepository(Perfil)
    private readonly PerfilRepository: Repository<Perfil>,
    @InjectRepository(Permissao)
    private readonly PermissaoRepository: Repository<Permissao>,
  ) {}

  async findAll(): Promise<Usuario[]> {
    return await this.UsuarioRepository.find({
      relations: ['perfil'],
    });
  }

  async findOne(usuario_id: number): Promise<Usuario> {
    const usuario = await this.UsuarioRepository.findOne({
      where: { usuario_id },
      relations: ['perfil'],
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

    // Criptografa a senha antes de salvar
    const senhaCriptografada = await PasswordUtils.criptografarSenha(
      CreateUsuarioDto.senha,
    );

    const usuario = this.UsuarioRepository.create({
      ...CreateUsuarioDto,
      senha: senhaCriptografada,
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

    // Verifica se a senha está criptografada e faz a comparação segura
    const senhaValida = await PasswordUtils.verificarSenha(
      senha,
      usuarioEncontrado.senha,
    );

    if (!senhaValida)
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Senha inválida',
      };

    usuarioEncontrado.is_logged = true;
    await this.UsuarioRepository.save(usuarioEncontrado);

    return {
      status: HttpStatus.OK,
      message: 'Usuário entrou com sucesso',
    };
  }

  async logoutUsuario(
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

    // Verifica se a senha está criptografada e faz a comparação segura
    const senhaValida = await PasswordUtils.verificarSenha(
      senha,
      usuarioEncontrado.senha,
    );

    if (!senhaValida)
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Senha inválida',
      };

    usuarioEncontrado.is_logged = false;
    await this.UsuarioRepository.save(usuarioEncontrado);

    return {
      status: HttpStatus.OK,
      message: 'Usuário saiu com sucesso',
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

    const { perfil_id, ...camposSimples } = updateUsuarioDto;

    // Se uma nova senha foi fornecida, criptografa ela
    if (camposSimples.senha) {
      camposSimples.senha = await PasswordUtils.criptografarSenha(
        camposSimples.senha,
      );
    }

    Object.assign(usuario, camposSimples);

    return await this.UsuarioRepository.save(usuario);
  }

  async remove(usuario_id: number): Promise<void> {
    const usuario = await this.findOne(usuario_id);

    await this.UsuarioRepository.remove(usuario);
  }

  async getPermissoesEfetivas(usuario_id: number): Promise<Permissao[]> {
    const usuario = await this.UsuarioRepository.findOne({
      where: { usuario_id },
      relations: ['perfil', 'perfil.permissoes', 'permissoes_extras'],
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuário com ID ${usuario_id} não encontrado`,
      );
    }

    return getPermissoesEfetivas(usuario);
  }

  // Método para adicionar permissões extras ao usuário
  async adicionarPermissoesExtras(
    usuario_id: number,
    permissao_ids: number[],
  ): Promise<Usuario> {
    const usuario = await this.findOne(usuario_id);
    const permissoes = await this.PermissaoRepository.createQueryBuilder(
      'permissao',
    )
      .where('permissao.permissao_id IN (:...ids)', { ids: permissao_ids })
      .getMany();

    usuario.permissoes_extras = [
      ...(usuario.permissoes_extras || []),
      ...permissoes,
    ];
    return await this.UsuarioRepository.save(usuario);
  }

  // Método para remover permissões extras do usuário
  async removerPermissoesExtras(
    usuario_id: number,
    permissao_ids: number[],
  ): Promise<Usuario> {
    const usuario = await this.findOne(usuario_id);

    usuario.permissoes_extras = usuario.permissoes_extras.filter(
      (p) => !permissao_ids.includes(p.permissao_id),
    );

    return await this.UsuarioRepository.save(usuario);
  }

  // Método para verificar se usuário tem permissão específica
  async temPermissao(
    usuario_id: number,
    modulo: string,
    acao: 'incluir' | 'editar' | 'excluir',
  ): Promise<boolean> {
    const permissoes = await this.getPermissoesEfetivas(usuario_id);
    const permissao = permissoes.find((p) => p.modulo === modulo);

    if (!permissao) return false;

    switch (acao) {
      case 'incluir':
        return permissao.pode_incluir;
      case 'editar':
        return permissao.pode_editar;
      case 'excluir':
        return permissao.pode_excluir;
      default:
        return false;
    }
  }

  // Método para obter usuário com todas as permissões carregadas
  async findOneComPermissoes(usuario_id: number): Promise<Usuario> {
    const usuario = await this.UsuarioRepository.findOne({
      where: { usuario_id },
      relations: ['perfil', 'perfil.permissoes', 'permissoes_extras'],
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuário com ID ${usuario_id} não encontrado`,
      );
    }

    return usuario;
  }
}
