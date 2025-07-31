import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Autenticacao } from '../auth/auth.guard';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  // @UseGuards(Autenticacao)
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Post('validar-usuario')
  @UseGuards(Autenticacao)
  validarUsuario(@Body() body: { usuario: string; senha: string }) {
    return this.usuarioService.validarUsuario(body.usuario, body.senha);
  }

  @Post('logout')
  @UseGuards(Autenticacao)
  logoutUsuario(@Body() body: { usuario: string; senha: string }) {
    return this.usuarioService.logoutUsuario(body.usuario, body.senha);
  }

  @Get()
  @UseGuards(Autenticacao)
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  @UseGuards(Autenticacao)
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(Autenticacao)
  @UseGuards(Autenticacao)
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(+id, updateUsuarioDto);
  }

  @Delete(':id')
  @UseGuards(Autenticacao)
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(+id);
  }
}
