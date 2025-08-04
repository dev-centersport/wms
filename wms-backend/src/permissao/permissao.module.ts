import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissaoService } from './permissao.service';
import { PermissaoController } from './permissao.controller';
import { Permissao } from './entities/permissao.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsuarioModule } from 'src/usuario/usuario.module';

@Module({
  imports: [TypeOrmModule.forFeature([Permissao]), AuthModule, UsuarioModule],
  controllers: [PermissaoController],
  providers: [PermissaoService],
  exports: [PermissaoService],
})
export class PermissaoModule {}
