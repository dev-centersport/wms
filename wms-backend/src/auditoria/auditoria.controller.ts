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
} from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';
import { StatusAuditoria } from './entities/auditoria.entity';

@Controller('auditorias')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Post()
  create(@Body() createAuditoriaDto: CreateAuditoriaDto) {
    return this.auditoriaService.create(createAuditoriaDto);
  }

  @Get()
  findAll(
    @Query('status') status?: StatusAuditoria,
    @Query('usuarioId') usuarioId?: number,
    @Query('ocorrenciaId') ocorrenciaId?: number,
  ) {
    if (status) {
      return this.auditoriaService.findByStatus(status);
    }
    if (usuarioId) {
      return this.auditoriaService.findByUsuario(+usuarioId);
    }
    if (ocorrenciaId) {
      return this.auditoriaService.findByOcorrencia(+ocorrenciaId);
    }
    return this.auditoriaService.findAll();
  }

  @Get('em-andamento')
  findAuditoriasEmAndamento() {
    return this.auditoriaService.findAuditoriasEmAndamento();
  }

  @Get('concluidas')
  findAuditoriasConcluidas() {
    return this.auditoriaService.findAuditoriasConcluidas();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.auditoriaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAuditoriaDto: UpdateAuditoriaDto,
  ) {
    return this.auditoriaService.update(id, updateAuditoriaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.auditoriaService.remove(id);
  }

  @Post(':id/iniciar')
  iniciar(@Param('id', ParseIntPipe) id: number) {
    return this.auditoriaService.iniciarAuditoria(id);
  }

  @Post(':id/concluir')
  concluir(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { conclusao: string; itens: any[] },
  ) {
    return this.auditoriaService.concluirAuditoria(
      id,
      body.conclusao,
      body.itens,
    );
  }

  @Post(':id/cancelar')
  cancelar(@Param('id', ParseIntPipe) id: number) {
    return this.auditoriaService.cancelarAuditoria(id);
  }

  @Get('usuario/:usuarioId')
  findByUsuario(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    return this.auditoriaService.findByUsuario(usuarioId);
  }

  @Get('ocorrencia/:ocorrenciaId')
  findByOcorrencia(@Param('ocorrenciaId', ParseIntPipe) ocorrenciaId: number) {
    return this.auditoriaService.findByOcorrencia(ocorrenciaId);
  }
}
