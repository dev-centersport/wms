import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { PasswordUtils } from 'src/utils/password.utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(usuario: string, senha: string): Promise<Usuario | null> {
    const user = await this.usuarioRepository.findOne({
      where: { usuario: usuario },
      relations: ['perfil'],
    });

    // Comparar com hash de senha mais tarde Ex: bcrypt.compare(senha, user.senha)
    // if (user && user.senha === senha) return user;
    if (user && (await PasswordUtils.verificarSenha(senha, user.senha)))
      return user;

    return null;
  }

  login(user: Usuario) {
    const payload = {
      sub: user.usuario_id,
      usuario: user.usuario,
      responsavel: user.responsavel,
      perfil: user.perfil.nome,
      perfil_id: user.perfil.perfil_id,
      pode_ver: user.perfil.pode_ver,
      pode_add: user.perfil.pode_add,
      pode_edit: user.perfil.pode_edit,
      pode_delete: user.perfil.pode_delete,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
