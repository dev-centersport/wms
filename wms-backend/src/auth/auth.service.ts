import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async validateUser(usuario: string, senha: string): Promise<Usuario | null> {
    const user = await this.usuarioRepository.findOneBy({ usuario });

    if (user && user.senha === senha) return user;

    return null;
  }
}
