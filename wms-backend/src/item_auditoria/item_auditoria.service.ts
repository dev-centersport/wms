import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemAuditoriaDto } from './dto/create-item_auditoria.dto';
import { UpdateItemAuditoriaDto } from './dto/update-item_auditoria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ItemAuditoria } from './entities/item_auditoria.entity';
import { Repository } from 'typeorm';
import { Auditoria } from 'src/auditoria/entities/auditoria.entity';

@Injectable()
export class ItemAuditoriaService {
  constructor(
    @InjectRepository(ItemAuditoria)
    private readonly itemAuditoriaRepository: Repository<ItemAuditoria>,
    @InjectRepository(Auditoria)
    private readonly auditoriaRepository: Repository<Auditoria>,
  ) {}

  async create(
    CreateItemAuditoriaDto: CreateItemAuditoriaDto,
  ): Promise<ItemAuditoria> {
    const auditoria = await this.auditoriaRepository.findOne({
      where: { auditoria_id: CreateItemAuditoriaDto.auditoria_id },
    });

    if (!auditoria) throw new NotFoundException('Auditoria não encontrada');

    const itemAuditoria = this.itemAuditoriaRepository.create({
      ...CreateItemAuditoriaDto,
      auditoria,
    });

    return await this.itemAuditoriaRepository.save(itemAuditoria);
  }

  async update(
    item_auditoria_id: number,
    UpdateItemAuditoriaDto: UpdateItemAuditoriaDto,
  ): Promise<ItemAuditoria> {
    const itemAuditoria = await this.itemAuditoriaRepository.findOne({
      where: { item_auditoria_id },
      relations: ['auditoria'],
    });

    if (!itemAuditoria)
      throw new NotFoundException('Ocorrência não encontrada');

    if (UpdateItemAuditoriaDto.auditoria_id !== undefined) {
      const auditoria = await this.auditoriaRepository.findOneBy({
        auditoria_id: UpdateItemAuditoriaDto.auditoria_id,
      });
      if (!auditoria)
        throw new NotFoundException('Produtos no estoque não encontrado');
    }

    const { auditoria_id, ...camposSimples } = UpdateItemAuditoriaDto;
    Object.assign(itemAuditoria, camposSimples);

    const itemAditoriaSalva =
      await this.itemAuditoriaRepository.save(itemAuditoria);

    return itemAditoriaSalva;
  }

  async findAll(): Promise<ItemAuditoria[]> {
    return await this.itemAuditoriaRepository.find({
      relations: ['auditoria'],
    });
  }

  async findOne(item_auditoria_id: number): Promise<ItemAuditoria> {
    const item_auditoria = await this.itemAuditoriaRepository.findOne({
      where: { item_auditoria_id },
      relations: ['auditoria'],
    });

    if (!item_auditoria)
      throw new NotFoundException(
        `Item auditoria com o ID ${item_auditoria_id} não encontrado`,
      );

    return item_auditoria;
  }

  async remove(item_auditoria_id: number): Promise<void> {
    const item_auditoria = await this.findOne(item_auditoria_id);

    await this.itemAuditoriaRepository.remove(item_auditoria);
  }
  // create(createItemAuditoriaDto: CreateItemAuditoriaDto) {
  //   return 'This action adds a new itemAuditoria';
  // }
  // findAll() {
  //   return `This action returns all itemAuditoria`;
  // }
  // findOne(id: number) {
  //   return `This action returns a #${id} itemAuditoria`;
  // }
  // update(id: number, updateItemAuditoriaDto: UpdateItemAuditoriaDto) {
  //   return `This action updates a #${id} itemAuditoria`;
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} itemAuditoria`;
  // }
}
