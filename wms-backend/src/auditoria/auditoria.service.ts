import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, FindManyOptions, In } from 'typeorm';
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
    private auditoriaRepository: Repository<Auditoria>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Ocorrencia)
    private ocorrenciaRepository: Repository<Ocorrencia>,
    @InjectRepository(ItemAuditoria)
    private itemAuditoriaRepository: Repository<ItemAuditoria>,
    @InjectRepository(Localizacao)
    private localizacaoRepository: Repository<Localizacao>,
  ) {}

  async create(createAuditoriaDto: CreateAuditoriaDto): Promise<Auditoria> {
    // Verifica usuário
    const usuario = await this.usuarioRepository.findOne({
      where: { usuario_id: createAuditoriaDto.usuario_id },
    });
    if (!usuario) {
      throw new NotFoundException(
        `Usuário com ID ${createAuditoriaDto.usuario_id} não encontrado`,
      );
    }

    // Verifica localização
    const localizacao = await this.localizacaoRepository.findOne({
      where: { localizacao_id: createAuditoriaDto.localizacao_id },
    });
    if (!localizacao) {
      throw new NotFoundException(
        `Localização com ID ${createAuditoriaDto.localizacao_id} não encontrada`,
      );
    }

    // Verifica ocorrências
    const ocorrenciasIds = createAuditoriaDto.ocorrencias.map(
      (o) => o.ocorrencia_id,
    );
    if (ocorrenciasIds.length === 0) {
      throw new NotFoundException(
        'A lista de ocorrências não pode estar vazia',
      );
    }

    let ocorrencias: Ocorrencia[] = [];

    // Caso especial: única ocorrência com ID 0
    if (ocorrenciasIds.length === 1 && ocorrenciasIds[0] === 0) {
      // Cria uma ocorrência "fake" (não salva no banco, só para vincular)
      ocorrencias = [this.ocorrenciaRepository.create({ ocorrencia_id: 0 })];
    } else {
      // Busca ocorrências válidas no banco
      const ocorrenciasExistentes = await this.ocorrenciaRepository.findBy({
        ocorrencia_id: In(ocorrenciasIds),
      });

      // Verifica se todas existem
      if (ocorrenciasExistentes.length !== ocorrenciasIds.length) {
        const encontrados = ocorrenciasExistentes.map((o) => o.ocorrencia_id);
        const naoEncontrados = ocorrenciasIds.filter(
          (id) => !encontrados.includes(id),
        );
        throw new NotFoundException(
          `Ocorrências com IDs ${naoEncontrados.join(', ')} não encontradas`,
        );
      }
      ocorrencias = ocorrenciasExistentes;
    }

    // Cria a auditoria
    const auditoria = this.auditoriaRepository.create({
      usuario,
      localizacao,
      ocorrencias, // Aqui o TypeORM fará o vínculo automaticamente
      status: StatusAuditoria.PENDENTE, // Define um status padrão
    });

    return this.auditoriaRepository.save(auditoria);
  }

  async findAll(options?: FindManyOptions<Auditoria>): Promise<Auditoria[]> {
    return this.auditoriaRepository.find({
      ...options,
      relations: ['usuario', 'ocorrencias', 'localizacao', 'itens_auditoria'],
    });
  }

  async findOne(
    id: number,
    options?: FindOneOptions<Auditoria>,
  ): Promise<Auditoria> {
    const auditoria = await this.auditoriaRepository.findOne({
      where: { auditoria_id: id },
      ...options,
      relations: ['usuario', 'ocorrencias', 'localizacao', 'itens_auditoria'],
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

      if (!usuario)
        throw new NotFoundException(
          `Usuário com ID ${updateAuditoriaDto.usuario_id} não foi encontrado`,
        );

      auditoria.usuario = usuario;
    }

    if (updateAuditoriaDto.ocorrencias) {
      const ocorrenciasIds = updateAuditoriaDto.ocorrencias.map(
        (o) => o.ocorrencia_id,
      );
      auditoria.ocorrencias =
        await this.ocorrenciaRepository.findByIds(ocorrenciasIds);
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

  // Ações com auditoria

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
    ocorrencias: Ocorrencia[],
  ): Promise<Auditoria> {
    const auditoria = await this.findOne(id);

    if (auditoria.status !== StatusAuditoria.EM_ANDAMENTO)
      throw new Error(
        'Só é possível concluir auditorias com status "em andamento"',
      );

    auditoria.status = StatusAuditoria.CONCLUIDA;
    auditoria.conclusao = conclusao;
    auditoria.data_hora_conclusao = new Date();

    // Salvar os itens de auditoria
    const itensSalvos: ItemAuditoria[] = await Promise.all(
      itens.map(async (item): Promise<ItemAuditoria> => {
        const itemAuditoria = this.itemAuditoriaRepository.create({
          ...item,
          auditoria,
        });
        return await this.itemAuditoriaRepository.save(itemAuditoria);
      }),
    );

    auditoria.itens_auditoria = itensSalvos;

    // Atualizar todas as ocorrências para ativo = false
    await Promise.all(
      ocorrencias.map(async (ocorrencia) => {
        ocorrencia.ativo = false;
        await this.ocorrenciaRepository.save(ocorrencia);
      }),
    );

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

  async findAuditoriasEmAndamento(): Promise<Auditoria[]> {
    return this.findByStatus(StatusAuditoria.EM_ANDAMENTO);
  }

  async findAuditoriasConcluidas(): Promise<Auditoria[]> {
    return this.findByStatus(StatusAuditoria.CONCLUIDA);
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
      where: { ocorrencias: { ocorrencia_id: ocorrencia_id } },
      relations: ['usuario', 'ocorrencia', 'localizacao', 'itens_auditoria'],
    });
  }
}
