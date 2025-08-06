import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FileiraService } from './fileira.service';
import { CreateFileiraDto } from './dto/create-fileira.dto';
import { UpdateFileiraDto } from './dto/update-fileira.dto';

@Controller('fileira')
export class FileiraController {
  constructor(private readonly fileiraService: FileiraService) {}

  @Post()
  create(@Body() createFileiraDto: CreateFileiraDto) {
    return this.fileiraService.create(createFileiraDto);
  }

  @Get()
  findAll() {
    return this.fileiraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileiraService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileiraDto: UpdateFileiraDto) {
    return this.fileiraService.update(+id, updateFileiraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileiraService.remove(+id);
  }
}
