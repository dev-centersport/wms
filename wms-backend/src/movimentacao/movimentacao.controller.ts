import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MovimentacaoService } from './movimentacao.service';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';

@Controller('movimentacao')
export class MovimentacaoController {
  constructor(private readonly movimentacaoService: MovimentacaoService) {}

  @Post()
  create(@Body() createMovimentacaoDto: CreateMovimentacaoDto) {
    const movimentacao = this.movimentacaoService.create(createMovimentacaoDto);
    return movimentacao;
  }

  @Get('abrir-localizacao/:ean')
  abrirLocalizacao(@Param('ean') ean: string) {
    return this.movimentacaoService.abrirLocalizacao(ean);
  }

  @Get('fechar-localizacao/:ean')
  fecharLocalizacao(@Param('ean') ean: string) {
    return this.movimentacaoService.fecharLocalizacao(ean);
  }

  @Get()
  findAll() {
    return this.movimentacaoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movimentacaoService.findOne(+id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateMovimentacaoDto: UpdateMovimentacaoDto,
  // ) {
  //   return this.movimentacaoService.update(+id, updateMovimentacaoDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.movimentacaoService.remove(+id);
  // }
}
