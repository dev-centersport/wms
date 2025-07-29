import { Body, Controller, Post, Session } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { usuario: string; senha: string },
    @Session() session: Record<string, any>,
  ): Promise<{ message: string }> {
    const { usuario, senha } = body;
    const user = await this.authService.validateUser(usuario, senha);

    if (!user) {
      return { message: 'Usuário ou senha inválidos' };
    }

    session.usuario_id = user?.usuario_id;
    return { message: 'Login realizado com sucesso!' };
  }

  @Post('logout')
  logout(@Session() session: Record<string, any>) {
    session.usuario_id = null;
    return { message: 'Logout realizado com sucesso!' };
  }
}
