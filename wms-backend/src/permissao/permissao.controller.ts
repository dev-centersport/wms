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
import { PermissaoService } from './permissao.service';
import { CreatePermissaoDto } from './dto/create-permissao.dto';
import { UpdatePermissaoDto } from './dto/update-permissao.dto';
import { Autenticacao } from '../auth/auth.guard';

@Controller('permissao')
export class PermissaoController {
  constructor(private readonly permissaoService: PermissaoService) {}

  @Post()
  @UseGuards(Autenticacao)
  create(@Body() createPermissaoDto: CreatePermissaoDto) {
    return this.permissaoService.create(createPermissaoDto);
  }

  @Get()
  @UseGuards(Autenticacao)
  findAll() {
    return this.permissaoService.findAll();
  }

  @Get('modulo/:modulo')
  @UseGuards(Autenticacao)
  findByModulo(@Param('modulo') modulo: string) {
    return this.permissaoService.findByModulo(modulo as any);
  }

  @Get(':id')
  @UseGuards(Autenticacao)
  findOne(@Param('id') id: string) {
    return this.permissaoService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(Autenticacao)
  update(
    @Param('id') id: string,
    @Body() updatePermissaoDto: UpdatePermissaoDto,
  ) {
    return this.permissaoService.update(+id, updatePermissaoDto);
  }

  @Delete(':id')
  @UseGuards(Autenticacao)
  remove(@Param('id') id: string) {
    return this.permissaoService.remove(+id);
  }

  @Post('criar-padrao')
  async criarPermissoesPadrao() {
    return await this.permissaoService.criarPermissoesPadrao();
  }
}
