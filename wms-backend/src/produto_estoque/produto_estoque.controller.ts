import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
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

  // @Get()
  // findAll() {
  //   return this.produtoEstoqueService.findAll();
  // }

  @Get()
  async search(
    @Query('search') search?: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('armazemId') armazemId?: string,
  ) {
    const results = await this.produtoEstoqueService.search(
      search,
      Number(offset) || 0,
      Number(limit) || 50,
      armazemId ? Number(armazemId) : undefined,
    );
    return results;
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
