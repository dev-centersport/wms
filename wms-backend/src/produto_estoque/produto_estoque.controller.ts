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

  @Get('listar-todos')
  listarTudo() {
    return this.produtoEstoqueService.listarTudo();
  }

  @Get()
  findAll() {
    return this.produtoEstoqueService.findAll();
  }

  @Get('relatorio')
  relatorioConsulta() {
    return this.produtoEstoqueService.relatorioConsulta();
  }

  @Get('pesquisar')
  async search(
    @Query('search') search?: string,
    @Query('offset') offset?: string,
    @Query('tipoId') tipoId?: number,
    @Query('armazemId') armazemId?: number,
  ) {
    const dados = await this.produtoEstoqueService.search(
      search,
      Number(offset) || 0,
      tipoId ? Number(tipoId) : undefined,
      armazemId ? Number(armazemId) : undefined,
    );

    if (search) {
      return dados;
    } else {
      return [];
    }
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
