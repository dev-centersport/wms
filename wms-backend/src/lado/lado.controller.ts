import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LadoService } from './lado.service';
import { CreateLadoDto } from './dto/create-lado.dto';
import { UpdateLadoDto } from './dto/update-lado.dto';

@Controller('lado')
export class LadoController {
  constructor(private readonly ladoService: LadoService) {}

  @Post()
  create(@Body() createLadoDto: CreateLadoDto) {
    return this.ladoService.create(createLadoDto);
  }

  @Get()
  findAll() {
    return this.ladoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ladoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLadoDto: UpdateLadoDto) {
    return this.ladoService.update(+id, updateLadoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ladoService.remove(+id);
  }
}
