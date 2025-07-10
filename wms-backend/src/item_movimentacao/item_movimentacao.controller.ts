import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ItemMovimentacaoService } from './item_movimentacao.service';
import { CreateItemMovimentacaoDto } from './dto/create-item_movimentacao.dto';
// import { UpdateItemMovimentacaoDto } from './dto/update-item_movimentacao.dto';

@Controller('item-movimentacao')
export class ItemMovimentacaoController {
  constructor(
    private readonly itemMovimentacaoService: ItemMovimentacaoService,
  ) {}

  @Post()
  create(@Body() createItemMovimentacaoDto: CreateItemMovimentacaoDto) {
    return this.itemMovimentacaoService.create(createItemMovimentacaoDto);
  }

  @Get()
  findAll() {
    return this.itemMovimentacaoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemMovimentacaoService.findOne(+id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateItemMovimentacaoDto: UpdateItemMovimentacaoDto,
  // ) {
  //   return this.itemMovimentacaoService.update(+id, updateItemMovimentacaoDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemMovimentacaoService.remove(+id);
  }
}
