import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgrupamentoService } from './agrupamento.service';
import { AgrupamentoController } from './agrupamento.controller';
import { Agrupamento } from './entities/agrupamento.entity';
import { Fileira } from 'src/fileira/entities/fileira.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Agrupamento, Fileira])],
  controllers: [AgrupamentoController],
  providers: [AgrupamentoService],
  exports: [AgrupamentoService],
})
export class AgrupamentoModule {}
