import { Module } from '@nestjs/common';
import { AgrupamentoService } from './agrupamento.service';
import { AgrupamentoController } from './agrupamento.controller';

@Module({
  controllers: [AgrupamentoController],
  providers: [AgrupamentoService],
})
export class AgrupamentoModule {}
