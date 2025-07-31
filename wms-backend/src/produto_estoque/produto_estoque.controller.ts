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
import { ProdutoEstoqueService } from './produto_estoque.service';
import { CreateProdutoEstoqueDto } from './dto/create-produto_estoque.dto';
import { UpdateProdutoEstoqueDto } from './dto/update-produto_estoque.dto';
import { Autenticacao } from 'src/auth/auth.guard';

@Controller('produto-estoque')
export class ProdutoEstoqueController {
  constructor(private readonly produtoEstoqueService: ProdutoEstoqueService) {}

  @Post()
  @UseGuards(Autenticacao)
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
  @UseGuards(Autenticacao)
  relatorioConsulta() {
    return this.produtoEstoqueService.relatorioConsulta();
  }

  @Get('pesquisar')
  @UseGuards(Autenticacao)
  async search(
    @Query('search') search?: string,
    @Query('offset') offset?: string,
    @Query('tipoId') tipoId?: number,
    @Query('armazemId') armazemId?: number,
    @Query('relatorio') relatorio?: string,
    @Query('show') show?: string,
  ) {
    const relatorioBool = String(relatorio).toLowerCase() === 'true';
    const showBool = String(show).toLowerCase() === 'false';

    const dados = await this.produtoEstoqueService.search(
      search,
      Number(offset) || 0,
      30,
      tipoId ? Number(tipoId) : undefined,
      armazemId ? Number(armazemId) : undefined,
      relatorioBool || false,
    );

    if (showBool) {
      if (search) {
        return dados;
      } else {
        return [];
      }
    }

    return dados;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.produtoEstoqueService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(Autenticacao)
  update(
    @Param('id') id: string,
    @Body() updateProdutoEstoqueDto: UpdateProdutoEstoqueDto,
  ) {
    return this.produtoEstoqueService.update(+id, updateProdutoEstoqueDto);
  }

  @Delete(':id')
  @UseGuards(Autenticacao)
  remove(@Param('id') id: string) {
    return this.produtoEstoqueService.remove(+id);
  }
}
