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
import { PerfilService } from './perfil.service';
import { CreatePerfilDto } from './dto/create-perfil.dto';
import { UpdatePerfilDto } from './dto/update-perfil.dto';
import { AdicionarPermissoesDto } from './dto/adicionar-permissoes.dto';
import { RemoverPermissoesDto } from './dto/remover-permissoes.dto';
import { DefinirPermissoesDto } from './dto/definir-permissoes.dto';
import { Autenticacao } from 'src/auth/auth.guard';

@Controller('perfil')
export class PerfilController {
  constructor(private readonly perfilService: PerfilService) {}

  @Post()
  @UseGuards(Autenticacao)
  create(@Body() createPerfilDto: CreatePerfilDto) {
    return this.perfilService.create(createPerfilDto);
  }

  @Get()
  findAll() {
    return this.perfilService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.perfilService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(Autenticacao)
  update(@Param('id') id: string, @Body() updatePerfilDto: UpdatePerfilDto) {
    return this.perfilService.update(+id, updatePerfilDto);
  }

  @Delete(':id')
  @UseGuards(Autenticacao)
  remove(@Param('id') id: string) {
    return this.perfilService.remove(+id);
  }

  @Post(':id/permissoes')
  @UseGuards(Autenticacao)
  async adicionarPermissoes(
    @Param('id') id: string,
    @Body() adicionarPermissoesDto: AdicionarPermissoesDto,
  ) {
    return await this.perfilService.adicionarPermissoes(
      +id,
      adicionarPermissoesDto.permissao_ids,
    );
  }

  @Delete(':id/permissoes')
  @UseGuards(Autenticacao)
  async removerPermissoes(
    @Param('id') id: string,
    @Body() removerPermissoesDto: RemoverPermissoesDto,
  ) {
    return await this.perfilService.removerPermissoes(
      +id,
      removerPermissoesDto.permissao_ids,
    );
  }

  @Patch(':id/permissoes')
  @UseGuards(Autenticacao)
  async definirPermissoes(
    @Param('id') id: string,
    @Body() definirPermissoesDto: DefinirPermissoesDto,
  ) {
    return await this.perfilService.definirPermissoes(
      +id,
      definirPermissoesDto.permissao_ids,
    );
  }
}
