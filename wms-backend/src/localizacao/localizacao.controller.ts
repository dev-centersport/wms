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
import { LocalizacaoService } from './localizacao.service';
import { CreateLocalizacaoDto } from './dto/create-localizacao.dto';
import { UpdateLocalizacaoDto } from './dto/update-localizacao.dto';
import { StatusPrateleira } from './entities/localizacao.entity';
import { Autenticacao } from 'src/auth/auth.guard';

@Controller('localizacao')
export class LocalizacaoController {
  constructor(private readonly localizacaoService: LocalizacaoService) {}

  @Post()
  @UseGuards(Autenticacao)
  create(@Body() createLocalizacaoDto: CreateLocalizacaoDto) {
    return this.localizacaoService.create(createLocalizacaoDto);
  }

  @Get()
  async search(
    @Query('search') search?: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: StatusPrateleira,
    @Query('armazemId') armazemId?: string,
    @Query('tipoId') tipoId?: string,
  ) {
    const results = await this.localizacaoService.search(
      search,
      Number(offset) || 0,
      Number(limit) || 50,
      status,
      armazemId ? Number(armazemId) : undefined,
      tipoId ? Number(tipoId) : undefined,
    );
    return results;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.localizacaoService.findOne(+id);
  }

  @Get('buscar-por-ean/:ean')
  encontrarLocalizacaoPorEan(@Param('ean') ean: string) {
    return this.localizacaoService.encontrarLocalizacaoPorEan(ean);
  }

  @Get(':id/produtos')
  async getProudutosPorLocalizacao(@Param('id') id: string) {
    return this.localizacaoService.getProdutosPorLocalizacao(parseInt(id));
  }

  @Patch(':id')
  @UseGuards(Autenticacao)
  update(
    @Param('id') id: string,
    @Body() updateLocalizacaoDto: UpdateLocalizacaoDto,
  ) {
    return this.localizacaoService.update(+id, updateLocalizacaoDto);
  }

  @Delete(':id')
  @UseGuards(Autenticacao)
  remove(@Param('id') id: string) {
    return this.localizacaoService.remove(+id);
  }
}
