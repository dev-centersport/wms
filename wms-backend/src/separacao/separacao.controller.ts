import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SeparacaoService } from './separacao.service';
import {
  SeparacaoUploadDTO,
  ResultadoSeparacaoDTO,
  ResultadoSeparacaoPorPedidoDTO,
} from './dto/separacao.dto.';
import { Autenticacao } from 'src/auth/auth.guard';

@Controller('separacao')
export class SeparacaoController {
  constructor(private readonly separacaoService: SeparacaoService) {}

  @Post('agrupado-produto')
  @UseGuards(Autenticacao)
  @UseInterceptors(FileInterceptor('arquivo'))
  async processarSeparacao(
    @UploadedFile() arquivo: Express.Multer.File,
    @Body() dto: SeparacaoUploadDTO,
  ): Promise<ResultadoSeparacaoDTO> {
    return this.separacaoService.processarSeparacao(
      arquivo,
      dto.armazemPrioritarioId,
    );
  }

  @Post('agrupado-pedido')
  @UseGuards(Autenticacao)
  @UseInterceptors(FileInterceptor('arquivo'))
  async processarSeparacaoPorPedido(
    @UploadedFile() arquivo: Express.Multer.File,
    @Body() dto: SeparacaoUploadDTO,
  ): Promise<ResultadoSeparacaoPorPedidoDTO> {
    return this.separacaoService.processarSeparacaoPorPedido(
      arquivo,
      dto.armazemPrioritarioId,
    );
  }
}
