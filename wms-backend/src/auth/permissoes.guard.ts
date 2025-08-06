import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsuarioService } from '../usuario/usuario.service';
import { PERMISSOES_KEY } from './decorators/permissoes.decorator';

@Injectable()
export class PermissoesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(forwardRef(() => UsuarioService))
    private usuarioService: UsuarioService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissoes = this.reflector.get<{ modulo: string; acao: string }>(
      PERMISSOES_KEY,
      context.getHandler(),
    );

    if (!permissoes) {
      return true; // Se não especificado, permite acesso
    }

    const { modulo, acao } = permissoes;

    const request = context.switchToHttp().getRequest();
    const usuario_id = request.user?.usuario_id; // Assumindo que o usuário está no request após autenticação

    if (!usuario_id) {
      return false;
    }

    return await this.usuarioService.temPermissao(
      usuario_id,
      modulo,
      acao as 'incluir' | 'editar' | 'excluir',
    );
  }
}
