import { Injectable } from '@nestjs/common';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Auditoria } from './entities/auditoria.entity';
import { Repository } from 'typeorm';
import { ItemAuditoria } from 'src/item_auditoria/entities/item_auditoria.entity';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria)
    private readonly auditoriaRepository: Repository<Auditoria>,
    @InjectRepository(ItemAuditoria)
    private readonly itemAuditoriaRepository: Repository<ItemAuditoria>,
  ) {}
  // create(createAuditoriaDto: CreateAuditoriaDto) {
  //   return 'This action adds a new auditoria';
  // }
  // findAll() {
  //   return `This action returns all auditoria`;
  // }
  // findOne(id: number) {
  //   return `This action returns a #${id} auditoria`;
  // }
  // update(id: number, updateAuditoriaDto: UpdateAuditoriaDto) {
  //   return `This action updates a #${id} auditoria`;
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} auditoria`;
  // }
}
