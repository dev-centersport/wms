import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

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
    if (user && user.senha === senha) return user;

    return null;
  }

  login(user: Usuario) {
    const payload = {
      sub: user.usuario_id,
      usuario: user.usuario,
      perfil: user.perfil.nome,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
