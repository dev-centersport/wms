import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

// Aqui começa a declaração para extender o tipo da sessão
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    usuario_id?: number;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (!request.session || !request.session.usuario_id) {
      throw new UnauthorizedException('Usuário não autenticado');
    }
    return true;
  }
}
