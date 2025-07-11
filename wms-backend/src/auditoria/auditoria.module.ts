import { Module } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { AuditoriaController } from './auditoria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auditoria } from './entities/auditoria.entity';
import { ItemAuditoria } from 'src/item_auditoria/entities/item_auditoria.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Ocorrencia } from 'src/ocorrencia/entities/ocorrencia.entity';
import { Localizacao } from 'src/localizacao/entities/localizacao.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Auditoria,
      ItemAuditoria,
      Usuario,
      Ocorrencia,
      Localizacao,
    ]),
  ],
  controllers: [AuditoriaController],
  providers: [AuditoriaService],
})
export class AuditoriaModule {}
