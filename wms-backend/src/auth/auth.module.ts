import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Autenticacao } from './auth.guard';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario]),
    JwtModule.register({
      secret: 'chave_secreta', // Substituir por uma varável de ambiente em produção
      signOptions: { expiresIn: '7d' }, // Aumentar para 7 dias temporariamente
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, Autenticacao],
  exports: [AuthService, Autenticacao, JwtModule],
})
export class AuthModule {}
