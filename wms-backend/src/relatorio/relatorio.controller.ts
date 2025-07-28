import { Controller, Get } from '@nestjs/common';
import { RelatorioService } from './relatorio.service';

@Controller('relatorio')
export class RelatorioController {
  constructor(private readonly relatorioService: RelatorioService) {}

  @Get('gerar-inventario')
  relatorioConsulta() {
    return this.relatorioService.relatorioConsulta();
  }
}
