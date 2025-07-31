import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtService } from '@nestjs/jwt';

// // Aqui começa a declaração para extender o tipo da sessão
// import 'express-session';

// declare module 'express-session' {
//   interface SessionData {
//     usuario_id?: number;
//   }
// }
interface JwtPayload {
  sub: number;
  usuario: string;
  perfil: string;
  iat: number; // issued at
  exp: number; // expiration
}

@Injectable()
export class Autenticacao implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const authHeader = request.headers['authorization'];

    if (!authHeader) throw new UnauthorizedException('Token não fornecido');

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token)
      throw new UnauthorizedException('Token inválido');

    try {
      const decoded = this.jwtService.verify<JwtPayload>(token, {
        secret: 'chave_secreta',
      });

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

        // Envia o novo token no header da resposta
        response.setHeader('X-New-Token', newToken);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (request as any).user = decoded; // Para manter o padrão do Express
      return true;
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    // if (!request.session || !request.session.usuario_id) {
    //   throw new UnauthorizedException('Usuário não autenticado');
    // }
    // return true;
  }
}
