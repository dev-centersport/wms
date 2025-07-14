import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SeparacaoService } from './separacao.service';
import {
  SeparacaoUploadDTO,
  ResultadoSeparacaoDTO,
} from './dto/separacao.dto.';

@Controller('separacao')
export class SeparacaoController {
  constructor(private readonly separacaoService: SeparacaoService) {}

  @Post('processar')
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
}
