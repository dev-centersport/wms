import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';
import { StatusAuditoria } from './entities/auditoria.entity';
import { CreateItemAuditoriaDto } from 'src/item_auditoria/dto/create-item_auditoria.dto';
import { Autenticacao } from 'src/auth/auth.guard';

@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Post()
  @UseGuards(Autenticacao)
  create(@Body() createAuditoriaDto: CreateAuditoriaDto) {
    return this.auditoriaService.create(createAuditoriaDto);
  }

  @Get()
  async search(
    @Query('search') search?: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: StatusAuditoria,
  ) {
    const results = await this.auditoriaService.search(
      search,
      Number(offset) || 0,
      Number(limit) || 50,
      status,
    );
    return results;
  }

  // @Get('em-andamento')
  // findAuditoriasEmAndamento() {
  //   return this.auditoriaService.findAuditoriasEmAndamento();
  // }

  // @Get('concluidas')
  // findAuditoriasConcluidas() {
  //   return this.auditoriaService.findAuditoriasConcluidas();
  // }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.auditoriaService.findOne(id);
  }

  @Get(':id/listar-ocorrencias')
  ocorrenciasDaAuditoria(@Param('id', ParseIntPipe) id: number) {
    return this.auditoriaService.ocorrenciasDaAuditoria(id);
  }

  @Patch(':id')
  @UseGuards(Autenticacao)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAuditoriaDto: UpdateAuditoriaDto,
  ) {
    return this.auditoriaService.update(id, updateAuditoriaDto);
  }

  @Delete(':id')
  @UseGuards(Autenticacao)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.auditoriaService.remove(id);
  }

  @Post(':id/iniciar')
  @UseGuards(Autenticacao)
  iniciarAuditoria(@Param('id', ParseIntPipe) id: number) {
    return this.auditoriaService.iniciarAuditoria(id);
  }

  @Post(':id/concluir')
  @UseGuards(Autenticacao)
  concluirAuditoria(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { conclusao: string; itens: CreateItemAuditoriaDto[] },
  ) {
    return this.auditoriaService.concluirAuditoria(
      id,
      body.conclusao,
      body.itens,
    );
  }

  @Post(':id/cancelar')
  @UseGuards(Autenticacao)
  cancelarAuditoria(@Param('id', ParseIntPipe) id: number) {
    return this.auditoriaService.cancelarAuditoria(id);
  }
}
