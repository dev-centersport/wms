import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProdutoService } from './produto.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { Autenticacao } from 'src/auth/auth.guard';

@Controller('produto')
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService) {}

  @Post()
  @UseGuards(Autenticacao)
  create(@Body() createProdutoDto: CreateProdutoDto) {
    return this.produtoService.create(createProdutoDto);
  }

  // @Get()
  // findAll() {
  //   return this.produtoService.findAll();
  // }

  @Get()
  async search(
    @Query('search') search?: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ) {
    const results = await this.produtoService.search(
      search,
      Number(offset) || 0,
      Number(limit) || 50,
    );
    return results;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produtoService.findOne(+id);
  }

  @Get('buscar-por-ean/:ean')
  @UseGuards(Autenticacao)
  encontrarProdutoPorEan(@Param('ean') ean: string) {
    return this.produtoService.encontrarProdutoPorEan(ean);
  }

  @Patch(':id')
  @UseGuards(Autenticacao)
  update(@Param('id') id: string, @Body() updateProdutoDto: UpdateProdutoDto) {
    return this.produtoService.update(+id, updateProdutoDto);
  }

  @Delete(':id')
  @UseGuards(Autenticacao)
  remove(@Param('id') id: string) {
    return this.produtoService.remove(+id);
  }
}
