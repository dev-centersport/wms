import { Controller, Get } from '@nestjs/common';
import { RelatorioService } from './relatorio.service';

@Controller('relatorio')
export class RelatorioController {
  constructor(private readonly relatorioService: RelatorioService) {}

  @Get('gerar-inventario')
  gerarInventario() {
    return this.relatorioService.gerarInventario();
  }

  @Get('gerar-consulta')
  gerarConsulta() {
    return this.relatorioService.gerarConsulta();
  }

  @Get('gerar-auditoria')
  gerarRelatorioAuditoria() {
    return this.relatorioService.gerarRelatorioAuditoria();
  }
}
