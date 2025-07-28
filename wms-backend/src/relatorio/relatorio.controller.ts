import { Controller, Get } from '@nestjs/common';
import { RelatorioService } from './relatorio.service';

@Controller('relatorio')
export class RelatorioController {
  constructor(private readonly relatorioService: RelatorioService) {}

  @Get('listar-produtos-com-estoque')
  relatorioConsulta() {
    return this.relatorioService.relatorioConsulta();
  }
}
