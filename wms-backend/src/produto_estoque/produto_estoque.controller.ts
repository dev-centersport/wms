import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProdutoEstoqueService } from './produto_estoque.service';
import { CreateProdutoEstoqueDto } from './dto/create-produto_estoque.dto';
import { UpdateProdutoEstoqueDto } from './dto/update-produto_estoque.dto';

@Controller('produto-estoque')
export class ProdutoEstoqueController {
  constructor(private readonly produtoEstoqueService: ProdutoEstoqueService) {}

  @Post()
  create(@Body() createProdutoEstoqueDto: CreateProdutoEstoqueDto) {
    return this.produtoEstoqueService.create(createProdutoEstoqueDto);
  }

  @Get()
  findAll() {
    return this.produtoEstoqueService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produtoEstoqueService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProdutoEstoqueDto: UpdateProdutoEstoqueDto,
  ) {
    return this.produtoEstoqueService.update(+id, updateProdutoEstoqueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.produtoEstoqueService.remove(+id);
  }
}
