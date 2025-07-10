import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { LocalizacaoService } from './localizacao.service';
import { CreateLocalizacaoDto } from './dto/create-localizacao.dto';
import { UpdateLocalizacaoDto } from './dto/update-localizacao.dto';

@Controller('localizacao')
export class LocalizacaoController {
  constructor(private readonly localizacaoService: LocalizacaoService) {}

  @Post()
  create(@Body() createLocalizacaoDto: CreateLocalizacaoDto) {
    return this.localizacaoService.create(createLocalizacaoDto);
  }

  @Get()
  findAll() {
    return this.localizacaoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.localizacaoService.findOne(+id);
  }

  @Get(':id/produtos')
  async getProudutosPorLocalizacao(@Param('id') id: string) {
    return this.localizacaoService.getProdutosPorLocalizacao(parseInt(id));
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLocalizacaoDto: UpdateLocalizacaoDto,
  ) {
    return this.localizacaoService.update(+id, updateLocalizacaoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.localizacaoService.remove(+id);
  }
}
