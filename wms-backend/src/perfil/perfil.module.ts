import { Module } from '@nestjs/common';
import { PerfilService } from './perfil.service';
import { PerfilController } from './perfil.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Perfil } from './entities/perfil.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Perfil, Usuario]), AuthModule],
  controllers: [PerfilController],
  providers: [PerfilService],
})
export class PerfilModule {}
