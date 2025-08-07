import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgrupamentoService } from './agrupamento.service';
import { AgrupamentoController } from './agrupamento.controller';
import { Agrupamento } from './entities/agrupamento.entity';
import { Lado } from 'src/lado/entities/lado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Agrupamento, Lado])],
  controllers: [AgrupamentoController],
  providers: [AgrupamentoService],
  exports: [AgrupamentoService],
})
export class AgrupamentoModule {}
