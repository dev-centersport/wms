import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AgrupamentoService } from './agrupamento.service';
import { CreateAgrupamentoDto } from './dto/create-agrupamento.dto';
import { UpdateAgrupamentoDto } from './dto/update-agrupamento.dto';

@Controller('agrupamento')
export class AgrupamentoController {
  constructor(private readonly agrupamentoService: AgrupamentoService) {}

  @Post()
  create(@Body() createAgrupamentoDto: CreateAgrupamentoDto) {
    return this.agrupamentoService.create(createAgrupamentoDto);
  }

  @Get()
  findAll() {
    return this.agrupamentoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agrupamentoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAgrupamentoDto: UpdateAgrupamentoDto) {
    return this.agrupamentoService.update(+id, updateAgrupamentoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agrupamentoService.remove(+id);
  }
}
