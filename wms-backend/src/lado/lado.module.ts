import { Module } from '@nestjs/common';
import { LadoService } from './lado.service';
import { LadoController } from './lado.controller';

@Module({
  controllers: [LadoController],
  providers: [LadoService],
})
export class LadoModule {}
