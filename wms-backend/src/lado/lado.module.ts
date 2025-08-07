import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LadoService } from './lado.service';
import { LadoController } from './lado.controller';
import { Lado } from './entities/lado.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lado])],
  controllers: [LadoController],
  providers: [LadoService],
})
export class LadoModule {}
