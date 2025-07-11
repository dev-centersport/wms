import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ItemAuditoriaService } from './item_auditoria.service';
import { CreateItemAuditoriaDto } from './dto/create-item_auditoria.dto';
import { UpdateItemAuditoriaDto } from './dto/update-item_auditoria.dto';

@Controller('item-auditoria')
export class ItemAuditoriaController {
  constructor(private readonly itemAuditoriaService: ItemAuditoriaService) {}

  @Post()
  create(@Body() createItemAuditoriaDto: CreateItemAuditoriaDto) {
    return this.itemAuditoriaService.create(createItemAuditoriaDto);
  }

  @Get()
  findAll() {
    return this.itemAuditoriaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemAuditoriaService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateItemAuditoriaDto: UpdateItemAuditoriaDto,
  ) {
    return this.itemAuditoriaService.update(+id, updateItemAuditoriaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemAuditoriaService.remove(+id);
  }
}
