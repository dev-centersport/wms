import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AdicionarPermissoesDto } from './dto/adicionar-permissoes.dto';
import { RemoverPermissoesDto } from './dto/remover-permissoes.dto';
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
  validarUsuario(@Body() body: { usuario: string; senha: string }) {
    return this.usuarioService.validarUsuario(body.usuario, body.senha);
  }

  @Post('logout')
  logoutUsuario(@Body() body: { usuario: string; senha: string }) {
    return this.usuarioService.logoutUsuario(body.usuario, body.senha);
  }

  @Get()
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuarioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.update(+id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuarioService.remove(+id);
  }

  @Get(':id/permissoes')
  async getPermissoes(@Param('id') id: string) {
    return await this.usuarioService.getPermissoesEfetivas(+id);
  }

  @Post(':id/permissoes-extras')
  async adicionarPermissoesExtras(
    @Param('id') id: string,
    @Body() adicionarPermissoesDto: AdicionarPermissoesDto,
  ) {
    return await this.usuarioService.adicionarPermissoesExtras(
      +id,
      adicionarPermissoesDto.permissao_ids,
    );
  }

  @Delete(':id/permissoes-extras')
  async removerPermissoesExtras(
    @Param('id') id: string,
    @Body() removerPermissoesDto: RemoverPermissoesDto,
  ) {
    return await this.usuarioService.removerPermissoesExtras(
      +id,
      removerPermissoesDto.permissao_ids,
    );
  }

  @Get(':id/tem-permissao')
  async temPermissao(
    @Param('id') id: string,
    @Query('modulo') modulo: string,
    @Query('acao') acao: 'incluir' | 'editar' | 'excluir',
  ) {
    return await this.usuarioService.temPermissao(+id, modulo, acao);
  }

  @Get(':id/com-permissoes')
  async findOneComPermissoes(@Param('id') id: string) {
    return await this.usuarioService.findOneComPermissoes(+id);
  }
}
