import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions, In, Brackets } from 'typeorm';
import { Auditoria } from './entities/auditoria.entity';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';
import { StatusAuditoria } from './entities/auditoria.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Ocorrencia } from '../ocorrencia/entities/ocorrencia.entity';
import { Localizacao } from '../localizacao/entities/localizacao.entity';
import { ItemAuditoria } from '../item_auditoria/entities/item_auditoria.entity';
import { CreateItemAuditoriaDto } from 'src/item_auditoria/dto/create-item_auditoria.dto';
import { ProdutoEstoque } from 'src/produto_estoque/entities/produto_estoque.entity';

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
    @InjectRepository(ProdutoEstoque)
    private readonly produtoEstoqueRepository: Repository<ProdutoEstoque>,
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
    });

    return this.auditoriaRepository.save(auditoria);
  }

  async search(
    search?: string,
    offset = 0,
    limit = 50,
    status?: StatusAuditoria,
  ): Promise<{ results: any[]; total_auditoria: number }> {
    const query = this.auditoriaRepository
      .createQueryBuilder('auditoria')
      .leftJoin('auditoria.usuario', 'usuario')
      .leftJoinAndSelect('auditoria.localizacao', 'localizacao')
      .select(['auditoria', 'usuario', 'localizacao'])
      .groupBy('auditoria.auditoria_id')
      .addGroupBy('usuario.usuario_id')
      .addGroupBy('localizacao.localizacao_id');

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('usuario.responsavel ILIKE :search', {
            search: `${search}`,
          }).orWhere('localizacao.nome ILIKE :search', {
            search: `${search}`,
          });
        }),
      );
    }

    if (status) {
      query.andWhere('auditoria.status = :status', { status });
    }

    const total_auditoria = await query.getCount();

    query.addOrderBy('localizacao.nome', 'ASC').offset(offset).limit(limit);

    const { entities, raw } = await query.getRawAndEntities();

    const results = entities.map((auditoria, index) => ({
      ...auditoria,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      total_auditoria: parseFloat(raw[index].total_auditoria) || 0,
    }));

    return { results, total_auditoria };
  }

  async findOne(
    id: number,
    options?: FindOneOptions<Auditoria>,
  ): Promise<Auditoria> {
    const auditoria = await this.auditoriaRepository.findOne({
      where: { auditoria_id: id },
      ...options,
      relations: ['usuario', 'ocorrencias', 'localizacao', 'localizacao.armazem', 'itens_auditoria'],
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
      auditoria.ocorrencias = await this.ocorrenciaRepository.findBy({
        ocorrencia_id: In(ocorrenciasIds),
      });
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

  // Funções unícas para auditoria

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
    itens: CreateItemAuditoriaDto[],
  ): Promise<Auditoria> {
    const auditoria = await this.auditoriaRepository.findOne({
      where: { auditoria_id: id },
      relations: ['ocorrencias'],
    });

    if (!auditoria)
      throw new NotFoundException(`Auditoria com ID ${id} não foi encontrada`);

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
        // Verificar se o produto_estoque existe
        const produtoEstoque = await this.produtoEstoqueRepository.findOne({
          where: { produto_estoque_id: item.produto_estoque_id },
        });

        if (!produtoEstoque) {
          throw new NotFoundException(
            `Produto estoque com ID ${item.produto_estoque_id} não encontrado`,
          );
        }

        const itemAuditoria = this.itemAuditoriaRepository.create({
          ...item,
          auditoria,
          produto_estoque: produtoEstoque,
        });
        return this.itemAuditoriaRepository.save(itemAuditoria);
      }),
    );

    const ocorrencias = auditoria.ocorrencias.map((o) => {
      return o;
    });

    if (ocorrencias.length > 0 && ocorrencias[0].ocorrencia_id !== 0) {
      // Extrai os IDs das ocorrências
      const ocorrenciaIds = ocorrencias.map((o) => o.ocorrencia_id);

      // Atualiza TODAS em uma única query
      await this.ocorrenciaRepository.update(
        { ocorrencia_id: In(ocorrenciaIds) }, // WHERE ocorrencia_id IN (ids...)
        { ativo: false }, // SET ativo = false
      );
    }
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

  async ocorrenciasDaAuditoria(auditoria_id: number): Promise<any> {
    const auditoria = await this.auditoriaRepository.findOne({
      where: { auditoria_id: auditoria_id },
    });

    if (!auditoria)
      throw new NotFoundException(
        `Auditoria com ID ${auditoria_id} não encontrada`,
      );

    const ocorrencias = await this.ocorrenciaRepository.find({
      where: { auditoria: auditoria },
      relations: ['produto_estoque.produto', 'localizacao.armazem'],
    });

    if (!ocorrencias || ocorrencias.length === 0)
      throw new NotFoundException(
        'Nenhuma ocorrência foi encontrada na auditoria',
      );

    const produtosAgrupados = ocorrencias.reduce(
      (acc, ocorrencia) => {
        const produtoId = ocorrencia.produto_estoque.produto.produto_id;

        if (!acc[produtoId]) {
          acc[produtoId] = {
            produto_id: produtoId,
            descricao: ocorrencia.produto_estoque.produto.descricao,
            sku: ocorrencia.produto_estoque.produto.sku,
            qtd_esperada: ocorrencia.quantidade_esperada,
            qtd_ocorrencias: 0,
          };
        }

        acc[produtoId].qtd_ocorrencias += 1;

        return acc;
      },
      {} as Record<
        number,
        {
          produto_id: number;
          descricao: string;
          sku: string;
          qtd_esperada: number;
          qtd_ocorrencias: number;
        }
      >,
    );

    const produtosArray = Object.values(produtosAgrupados);

    return [
      {
        armazem:
          ocorrencias[0].localizacao.armazem?.nome || null,
        localizacao:
          ocorrencias[0].localizacao?.nome || null,
        quantidade: ocorrencias.length,
        produto: produtosArray,
      },
    ];
  }

  async findByLocalizacao(localizacao_id: number): Promise<Auditoria[]> {
    return this.auditoriaRepository.find({
      where: { 
        localizacao: { localizacao_id: localizacao_id },
        status: StatusAuditoria.EM_ANDAMENTO 
      },
      relations: ['localizacao', 'localizacao.armazem'],
      order: { auditoria_id: 'DESC' },
    });
  }

  // async findByStatus(status: StatusAuditoria): Promise<Auditoria[]> {
  //   return this.auditoriaRepository.find({
  //     where: { status },
  //     relations: ['usuario', 'ocorrencia', 'localizacao', 'itens_auditoria'],
  //   });
  // }

  // async findByUsuario(usuario_id: number): Promise<Auditoria[]> {
  //   return this.auditoriaRepository.find({
  //     where: { usuario: { usuario_id: usuario_id } },
  //     relations: ['usuario', 'ocorrencia', 'localizacao', 'itens_auditoria'],
  //   });
  // }

  // async findByOcorrencia(ocorrencia_id: number): Promise<Auditoria[]> {
  //   return this.auditoriaRepository.find({
  //     where: { ocorrencias: { ocorrencia_id: ocorrencia_id } },
  //     relations: ['usuario', 'ocorrencia', 'localizacao', 'itens_auditoria'],
  //   });
  // }

  // async findAuditoriasEmAndamento(): Promise<Auditoria[]> {
  //   return this.findByStatus(StatusAuditoria.EM_ANDAMENTO);
  // }

  // async findAuditoriasConcluidas(): Promise<Auditoria[]> {
  //   return this.findByStatus(StatusAuditoria.CONCLUIDA);
  // }
}
