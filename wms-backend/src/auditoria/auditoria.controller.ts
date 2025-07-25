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

@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Post()
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

  @Get('usuario/:usuario_id')
  findByUsuario(@Param('usuario_id', ParseIntPipe) usuario_id: number) {
    return this.auditoriaService.findByUsuario(usuario_id);
  }

  @Get('ocorrencia/:ocorrencia_id')
  findByOcorrencia(
    @Param('ocorrencia_id', ParseIntPipe) ocorrencia_id: number,
  ) {
    return this.auditoriaService.findByOcorrencia(ocorrencia_id);
  }
}
