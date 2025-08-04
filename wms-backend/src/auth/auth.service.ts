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

    if (!user) return null;

    // Comparar com hash de senha mais tarde Ex: bcrypt.compare(senha, user.senha)
    // if (user && user.senha === senha) return user;
    if (user && (await PasswordUtils.verificarSenha(senha, user.senha)))
      return user;

    return null;
  }

  async login(user: Usuario) {
    const payload = {
      sub: user.usuario_id,
      usuario: user.usuario,
      perfil: user.perfil.nome,
    };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: '1d',
    });

    // 🔒 SESSÃO ÚNICA: Atualiza o token atual do usuário
    // Isso invalida automaticamente qualquer sessão anterior
    user.current_token = access_token;
    user.is_logged = true;
    await this.usuarioRepository.save(user);

    return {
      access_token,
      usuario_id: user.usuario_id,
      usuario: user.usuario,
      nivel: user.nivel,
      perfil: user.perfil.nome,
    };
  }

  // 🔒 MÉTODO PARA LOGOUT (opcional, mas recomendado)
  async logout(usuario_id: number): Promise<void> {
    const user = await this.usuarioRepository.findOne({
      where: { usuario_id },
    });

    if (user) {
      user.current_token = null;
      user.is_logged = false;
      await this.usuarioRepository.save(user);
    }
  }
}
