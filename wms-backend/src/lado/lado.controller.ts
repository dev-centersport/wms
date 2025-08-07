import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { LadoService } from './lado.service';
import { CreateLadoDto } from './dto/create-lado.dto';
import { UpdateLadoDto } from './dto/update-lado.dto';

@Controller('lado')
export class LadoController {
  constructor(private readonly ladoService: LadoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLadoDto: CreateLadoDto) {
    return this.ladoService.create(createLadoDto);
  }

  @Get()
  findAll() {
    return this.ladoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ladoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLadoDto: UpdateLadoDto,
  ) {
    return this.ladoService.update(id, updateLadoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ladoService.remove(id);
  }
}
