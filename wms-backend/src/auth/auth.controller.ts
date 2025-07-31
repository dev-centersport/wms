/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Request as ExpressRequest } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() body: { usuario: string; senha: string },
    // @Session() session: Record<string, any>,
  ): Promise<any> {
    const { usuario, senha } = body;
    const user = await this.authService.validateUser(usuario, senha);

    if (!user) {
      return { message: 'Usuário ou senha inválidos' };
    }

    // session.usuario_id = user?.usuario_id;
    // Retorna JWT
    return this.authService.login(user);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@Req() req: ExpressRequest) {
    if (!req.user) throw new NotFoundException('Usuário não foi encontrado');

    // req.user será preenchido pelo guard com os dados do token JWT
    return {
      usuario: req.user['usuario'],
      perfil: req.user['perfil'],
      usuario_id: req.user['sub'],
    };
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

  // Ler uma informação da sessão
  @Get('get')
  getSessionInfo(@Req() req: any) {
    // Supondo que você salvou algo como req.session.user
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return req.session.usuario_id;
  }
}
