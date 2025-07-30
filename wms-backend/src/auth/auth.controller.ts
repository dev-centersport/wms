/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Body, Controller, Get, Post, Req, Session } from '@nestjs/common';
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
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      session.destroy((err: any) => {
        if (err) {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          reject({ message: 'Erro ao fazer logout!' });
        } else {
          resolve({ message: 'Logout realizado com sucesso!' });
        }
      });
    });
  }

  @Get('all')
  getAllSessions(@Req() req: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return Object.entries(req.sessionStore.sessions || {}).map(
      ([sid, val]) => ({ sid, data: JSON.parse(val as string) }),
    );
  }
}
