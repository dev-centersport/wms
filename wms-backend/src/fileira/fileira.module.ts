import { Module } from '@nestjs/common';
import { FileiraService } from './fileira.service';
import { FileiraController } from './fileira.controller';

@Module({
  controllers: [FileiraController],
  providers: [FileiraService],
})
export class FileiraModule {}
