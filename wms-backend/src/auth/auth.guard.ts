import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';

interface JwtPayload {
  sub: number;
  usuario: string;
  perfil: string;
  iat: number; // issued at
  exp: number; // expiration
}

@Injectable()
export class Autenticacao implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const authHeader = request.headers['authorization'];

    console.log('Verificando autenticação para:', request.url);
    console.log('Headers de autorização:', authHeader ? 'Presente' : 'Ausente');

    if (!authHeader) {
      console.log('Token não fornecido');
      throw new UnauthorizedException('Token não fornecido');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      console.log('Token inválido - formato incorreto');
      throw new UnauthorizedException('Token inválido');
    }

    try {
      const decoded = this.jwtService.verify<JwtPayload>(token, {
        secret: 'chave_secreta',
      });

      // 🔒 VERIFICAÇÃO DE SESSÃO ÚNICA
      // Busca o usuário no banco e verifica se o token atual corresponde
      const user = await this.usuarioRepository.findOne({
        where: { usuario_id: decoded.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      // Verifica se o token enviado é o mesmo armazenado no banco
      if (user.current_token !== token) {
        throw new UnauthorizedException(
          'Sessão expirada. Realize login novamente.',
        );
      }


      // Verifica se o token expira em menos de 10 minutos
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = decoded.exp - now;
      const tenMinutes = 10 * 60; // 10 minutos em segundos

      if (timeUntilExpiry < tenMinutes && timeUntilExpiry > 0) {
        // Renova o token automaticamente
        const newPayload = {
          sub: decoded.sub,
          usuario: decoded.usuario,
          perfil: decoded.perfil,
        };

        const newToken = this.jwtService.sign(newPayload);

        // Atualiza o token no banco
        user.current_token = newToken;
        await this.usuarioRepository.save(user);

        // Envia o novo token no header da resposta
        response.setHeader('X-New-Token', newToken);
        console.log('Token renovado automaticamente');
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (request as any).user = decoded; // Para manter o padrão do Express
      return true;
    } catch (err) {

      console.log('Erro de autenticação:', err);

      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
