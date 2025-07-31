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
import { OcorrenciaService } from './ocorrencia.service';
import { CreateOcorrenciaDto } from './dto/create-ocorrencia.dto';
import { UpdateOcorrenciaDto } from './dto/update-ocorrencia.dto';
import { Autenticacao } from 'src/auth/auth.guard';

@Controller('ocorrencia')
export class OcorrenciaController {
  constructor(private readonly ocorrenciaService: OcorrenciaService) {}

  @Post()
  @UseGuards(Autenticacao)
  create(@Body() createOcorrenciaDto: CreateOcorrenciaDto) {
    return this.ocorrenciaService.create(createOcorrenciaDto);
  }

  @Get()
  findAll() {
    return this.ocorrenciaService.findAll();
  }

  @Get('listar-por-localizacao')
  @UseGuards(Autenticacao)
  listarPorLocalizacao() {
    return this.ocorrenciaService.listarPorLocalizacao();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ocorrenciaService.findOne(+id);
  }

  @Get(':id/ocorrencias-da-localizacao')
  @UseGuards(Autenticacao)
  ocorrenciasDaLocalizacao(@Param('id') id: string) {
    return this.ocorrenciaService.ocorrenciasDaLocalizacao(+id);
  }

  // @Get(':id/listar-produtos')
  // listarProdutosDaOcorrencia(@Param('id') id: string) {
  //   return this.ocorrenciaService.listarProdutosDaOcorrencia(+id);
  // }

  @Patch(':id')
  @UseGuards(Autenticacao)
  update(
    @Param('id') id: string,
    @Body() updateOcorrenciaDto: UpdateOcorrenciaDto,
  ) {
    return this.ocorrenciaService.update(+id, updateOcorrenciaDto);
  }

  @Delete(':id')
  @UseGuards(Autenticacao)
  remove(@Param('id') id: string) {
    return this.ocorrenciaService.remove(+id);
  }
}
