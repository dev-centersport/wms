import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, FindManyOptions } from 'typeorm';
import { Auditoria } from './entities/auditoria.entity';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';
import { StatusAuditoria } from './entities/auditoria.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Ocorrencia } from '../ocorrencia/entities/ocorrencia.entity';
import { Localizacao } from '../localizacao/entities/localizacao.entity';
import { ItemAuditoria } from '../item_auditoria/entities/item_auditoria.entity';

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(Auditoria)
    private readonly auditoriaRepository: Repository<Auditoria>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Ocorrencia)
    private readonly ocorrenciaRepository: Repository<Ocorrencia>,
    @InjectRepository(Localizacao)
    private readonly localizacaoRepository: Repository<Localizacao>,
    @InjectRepository(ItemAuditoria)
    private readonly itemAuditoriaRepository: Repository<ItemAuditoria>,
  ) {}

  async create(createAuditoriaDto: CreateAuditoriaDto): Promise<Auditoria> {
    // Verificar se o usuário existe
    const usuario = await this.usuarioRepository.findOne({
      where: { usuario_id: createAuditoriaDto.usuario_id },
    });
    if (!usuario) {
      throw new NotFoundException(
        `Usuário com ID ${createAuditoriaDto.usuario_id} não encontrado`,
      );
    }

    // Verificar se a ocorrência existe
    const ocorrencia = await this.ocorrenciaRepository.findOne({
      where: { ocorrencia_id: createAuditoriaDto.ocorrencia_id },
    });
    if (!ocorrencia) {
      throw new NotFoundException(
        `Ocorrência com ID ${createAuditoriaDto.ocorrencia_id} não encontrada`,
      );
    }

    // Verificar se a localização existe
    const localizacao = await this.localizacaoRepository.findOne({
      where: { localizacao_id: createAuditoriaDto.localizacao_id },
    });
    if (!localizacao) {
      throw new NotFoundException(
        `Localização com ID ${createAuditoriaDto.localizacao_id} não encontrada`,
      );
    }

    const auditoria = this.auditoriaRepository.create({
      ...createAuditoriaDto,
      usuario,
      ocorrencia,
      localizacao,
    });

    return this.auditoriaRepository.save(auditoria);
  }

  async findAll(options?: FindManyOptions<Auditoria>): Promise<Auditoria[]> {
    return this.auditoriaRepository.find({
      ...options,
      relations: ['usuario', 'ocorrencia', 'localizacao', 'itens_auditoria'],
    });
  }

  async findOne(
    id: number,
    options?: FindOneOptions<Auditoria>,
  ): Promise<Auditoria> {
    const auditoria = await this.auditoriaRepository.findOne({
      where: { auditoria_id: id },
      ...options,
      relations: ['usuario', 'ocorrencia', 'localizacao', 'itens_auditoria'],
    });

    if (!auditoria) {
      throw new NotFoundException(`Auditoria com ID ${id} não encontrada`);
    }

    return auditoria;
  }

  async update(
    id: number,
    updateAuditoriaDto: UpdateAuditoriaDto,
  ): Promise<Auditoria> {
    const auditoria = await this.findOne(id);

    if (updateAuditoriaDto.usuario_id) {
      const usuario = await this.usuarioRepository.findOne({
        where: { usuario_id: updateAuditoriaDto.usuario_id },
      });
      if (!usuario) {
        throw new NotFoundException(
          `Usuário com ID ${updateAuditoriaDto.usuario_id} não encontrado`,
        );
      }
      auditoria.usuario = usuario;
    }

    if (updateAuditoriaDto.ocorrencia_id) {
      const ocorrencia = await this.ocorrenciaRepository.findOne({
        where: { ocorrencia_id: updateAuditoriaDto.ocorrencia_id },
      });
      if (!ocorrencia) {
        throw new NotFoundException(
          `Ocorrência com ID ${updateAuditoriaDto.ocorrencia_id} não encontrada`,
        );
      }
      auditoria.ocorrencia = ocorrencia;
    }

    if (updateAuditoriaDto.localizacao_id) {
      const localizacao = await this.localizacaoRepository.findOne({
        where: { localizacao_id: updateAuditoriaDto.localizacao_id },
      });
      if (!localizacao) {
        throw new NotFoundException(
          `Localização com ID ${updateAuditoriaDto.localizacao_id} não encontrada`,
        );
      }
      auditoria.localizacao = localizacao;
    }

    // Atualiza campos diretos
    if (updateAuditoriaDto.conclusao !== undefined) {
      auditoria.conclusao = updateAuditoriaDto.conclusao;
    }
    if (updateAuditoriaDto.data_hora_inicio !== undefined) {
      auditoria.data_hora_inicio = updateAuditoriaDto.data_hora_inicio;
    }
    if (updateAuditoriaDto.data_hora_conclusao !== undefined) {
      auditoria.data_hora_conclusao = updateAuditoriaDto.data_hora_conclusao;
    }
    if (updateAuditoriaDto.status !== undefined) {
      auditoria.status = updateAuditoriaDto.status;
    }

    return this.auditoriaRepository.save(auditoria);
  }

  async remove(id: number): Promise<void> {
    const auditoria = await this.findOne(id);
    await this.auditoriaRepository.remove(auditoria);
  }

  async iniciarAuditoria(id: number): Promise<Auditoria> {
    const auditoria = await this.findOne(id);

    if (auditoria.status !== StatusAuditoria.PENDENTE) {
      throw new Error('Só é possível iniciar auditorias com status "pendente"');
    }

    auditoria.status = StatusAuditoria.EM_ANDAMENTO;
    auditoria.data_hora_inicio = new Date();
    return this.auditoriaRepository.save(auditoria);
  }

  async concluirAuditoria(
    id: number,
    conclusao: string,
    itens: ItemAuditoria[],
  ): Promise<Auditoria> {
    const auditoria = await this.findOne(id);

    if (auditoria.status !== StatusAuditoria.EM_ANDAMENTO) {
      throw new Error(
        'Só é possível concluir auditorias com status "em andamento"',
      );
    }

    auditoria.status = StatusAuditoria.CONCLUIDA;
    auditoria.conclusao = conclusao;
    auditoria.data_hora_conclusao = new Date();

    // Salvar os itens de auditoria
    const itensSalvos = await Promise.all(
      itens.map(async (item) => {
        const itemAuditoria = this.itemAuditoriaRepository.create({
          ...item,
          auditoria,
        });
        return this.itemAuditoriaRepository.save(itemAuditoria);
      }),
    );

    auditoria.itens_auditoria = itensSalvos;

    return this.auditoriaRepository.save(auditoria);
  }

  async cancelarAuditoria(id: number): Promise<Auditoria> {
    const auditoria = await this.findOne(id);

    if (
      auditoria.status === StatusAuditoria.CONCLUIDA ||
      auditoria.status === StatusAuditoria.CANCELADA
    ) {
      throw new Error(
        'Não é possível cancelar auditorias já concluídas ou canceladas',
      );
    }

    auditoria.status = StatusAuditoria.CANCELADA;
    return this.auditoriaRepository.save(auditoria);
  }

  async findByStatus(status: StatusAuditoria): Promise<Auditoria[]> {
    return this.auditoriaRepository.find({
      where: { status },
      relations: ['usuario', 'ocorrencia', 'localizacao', 'itens_auditoria'],
    });
  }

  async findByUsuario(usuario_id: number): Promise<Auditoria[]> {
    return this.auditoriaRepository.find({
      where: { usuario: { usuario_id: usuario_id } },
      relations: ['usuario', 'ocorrencia', 'localizacao', 'itens_auditoria'],
    });
  }

  async findByOcorrencia(ocorrencia_id: number): Promise<Auditoria[]> {
    return this.auditoriaRepository.find({
      where: { ocorrencia: { ocorrencia_id: ocorrencia_id } },
      relations: ['usuario', 'ocorrencia', 'localizacao', 'itens_auditoria'],
    });
  }

  async findAuditoriasEmAndamento(): Promise<Auditoria[]> {
    return this.findByStatus(StatusAuditoria.EM_ANDAMENTO);
  }

  async findAuditoriasConcluidas(): Promise<Auditoria[]> {
    return this.findByStatus(StatusAuditoria.CONCLUIDA);
  }
}
