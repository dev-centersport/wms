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
import { TipoLocalizacaoService } from './tipo_localizacao.service';
import { CreateTipoLocalizacaoDto } from './dto/create-tipo_localizacao.dto';
import { UpdateTipoLocalizacaoDto } from './dto/update-tipo_localizacao.dto';
import { Autenticacao } from '../auth/auth.guard';

@Controller('tipo-localizacao')
export class TipoLocalizacaoController {
  constructor(
    private readonly tipoLocalizacaoService: TipoLocalizacaoService,
  ) {}

  @Post()
  @UseGuards(Autenticacao)
  create(@Body() createTipoLocalizacaoDto: CreateTipoLocalizacaoDto) {
    return this.tipoLocalizacaoService.create(createTipoLocalizacaoDto);
  }

  @Get()
  findAll() {
    return this.tipoLocalizacaoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tipoLocalizacaoService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(Autenticacao)
  update(
    @Param('id') id: string,
    @Body() updateTipoLocalizacaoDto: UpdateTipoLocalizacaoDto,
  ) {
    return this.tipoLocalizacaoService.update(+id, updateTipoLocalizacaoDto);
  }

  @Delete(':id')
  @UseGuards(Autenticacao)
  remove(@Param('id') id: string) {
    return this.tipoLocalizacaoService.remove(+id);
  }
}
