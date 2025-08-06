import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileiraService } from './fileira.service';
import { FileiraController } from './fileira.controller';
import { Fileira } from './entities/fileira.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Fileira])],
  controllers: [FileiraController],
  providers: [FileiraService],
  exports: [FileiraService],
})
export class FileiraModule {}
