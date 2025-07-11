import { Module } from '@nestjs/common';
import { ItemAuditoriaService } from './item_auditoria.service';
import { ItemAuditoriaController } from './item_auditoria.controller';
import { ItemAuditoria } from './entities/item_auditoria.entity';
import { Auditoria } from 'src/auditoria/entities/auditoria.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ItemAuditoria, Auditoria])],
  controllers: [ItemAuditoriaController],
  providers: [ItemAuditoriaService],
})
export class ItemAuditoriaModule {}
