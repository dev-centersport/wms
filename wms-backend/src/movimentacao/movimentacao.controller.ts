import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MovimentacaoService } from './movimentacao.service';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';
import { UpdateMovimentacaoDto } from './dto/update-movimentacao.dto';

@Controller('movimentacao')
export class MovimentacaoController {
  constructor(private readonly movimentacaoService: MovimentacaoService) {}

  @Post()
  create(@Body() createMovimentacaoDto: CreateMovimentacaoDto) {
    return this.movimentacaoService.create(createMovimentacaoDto);
  }

  @Get()
  findAll() {
    return this.movimentacaoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movimentacaoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMovimentacaoDto: UpdateMovimentacaoDto) {
    return this.movimentacaoService.update(+id, updateMovimentacaoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.movimentacaoService.remove(+id);
  }
}
