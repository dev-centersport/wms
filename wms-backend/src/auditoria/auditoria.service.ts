import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { LocalizacoesProximasDto } from './dto/localizacoes-proximas.dto';

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
      .leftJoin('auditoria.localizacao', 'localizacao')
      .leftJoin('auditoria.ocorrencias', 'ocorrencias')
      .select(['auditoria', 'usuario', 'localizacao', 'ocorrencias'])
      .groupBy('auditoria.auditoria_id')
      .addGroupBy('usuario.usuario_id')
      .addGroupBy('localizacao.localizacao_id')
      .addGroupBy('ocorrencias.ocorrencia_id');

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

    const results = entities.map((localizacao, index) => ({
      ...localizacao,
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
    localizacoes_proximas: LocalizacoesProximasDto,
  ): Promise<Auditoria> {
    const auditoria = await this.auditoriaRepository.findOne({
      where: { auditoria_id: id },
      relations: ['ocorrencias'],
    });

    if (!auditoria)
      throw new NotFoundException(`Auditoria com ID ${id} não foi encontrada`);

    if (auditoria.status !== StatusAuditoria.EM_ANDAMENTO) {
      throw new BadRequestException(
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

    // Estrutura consolidada das localizações para persistência
    const localizacoesContadas: {
      localizacao_id: number;
      produtos: { produto_id: number; quantidade: number }[];
    }[] = [];

    for (const localizacaoDto of localizacoes_proximas.localizacoes_proximas) {
      // Busca a localização no banco de dados
      const localizacaoEncontrada = await this.localizacaoRepository.findOne({
        where: { localizacao_id: localizacaoDto.localizacao_id },
        relations: ['itens_localizacao', 'itens_localizacao.produto'],
      });

      if (!localizacaoEncontrada)
        throw new NotFoundException(
          `Não foi encontrado a localização com ID ${localizacaoDto.localizacao_id}`,
        );

      const estoqueLocalizacao = await this.produtoEstoqueRepository.find({
        where: { localizacao: localizacaoEncontrada },
      });

      if (!estoqueLocalizacao || estoqueLocalizacao.length === 0)
        throw new NotFoundException(
          `Não foi encontrado nenhum estoque no ID ${localizacaoDto.localizacao_id}`,
        );

      // Mapeia quantos produtos de cada tipo apareceram no request
      const contagemProdutos = new Map<number, number>();
      for (const itemDto of localizacaoDto.itens_localizacao) {
        const produtoId = itemDto.produto.produto_id;
        contagemProdutos.set(
          produtoId,
          (contagemProdutos.get(produtoId) ?? 0) + 1,
        );
      }

      // Para persistir no banco, armazene a contagem por produto_id:
      localizacoesContadas.push({
        localizacao_id: localizacaoDto.localizacao_id,
        produtos: Array.from(contagemProdutos.entries()).map(
          ([produto_id, quantidade]) => ({
            produto_id,
            quantidade,
          }),
        ),
      });

      // Para cada produto contado, verifica com o estoque do banco
      for (const [produtoId, quantidadeContada] of contagemProdutos.entries()) {
        const itemEstoque = estoqueLocalizacao.find(
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (item: any) => item.produto_id === produtoId,
        );

        if (!itemEstoque) {
          throw new NotFoundException(
            `Produto ID ${produtoId} não encontrado no estoque da Localização ID ${localizacaoDto.localizacao_id}`,
          );
        }

        const quantidadeBanco = itemEstoque.quantidade;
        if (quantidadeBanco !== quantidadeContada) {
          console.log(
            `Estoque divergente para Produto ID ${produtoId} na Localização ID ${localizacaoDto.localizacao_id}. Esperado: ${quantidadeBanco}, Recebido: ${quantidadeContada}`,
          );
        } else {
          console.log(
            `Estoque OK para Produto ID ${produtoId} na Localização ID ${localizacaoDto.localizacao_id}`,
          );
        }
      }
    }

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
    auditoria.localizacoes_proximas = [localizacoes_proximas];

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

  async produtosDaAuditoria(auditoria_id: number): Promise<any> {
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

    const localizacao = ocorrencias[0].localizacao;

    const produtosLocalizacao = await this.produtoEstoqueRepository.find({
      where: { localizacao: localizacao },
      relations: ['produto'],
    });

    const produtosComOcorrencias = ocorrencias.reduce((map, o) => {
      const produtoId = o.produto_estoque.produto.produto_id;

      map[produtoId] = {
        temOcorrencia: true,
        qtd_esperada: o.quantidade_esperada,
        qtd_sistema: o.quantidade_sistemas,
      };
      return map;
    }, {});

    // Formata todos os produtos da localização
    const produtosFormatados = produtosLocalizacao.map((produtoEstoque) => {
      const produtoId = produtoEstoque.produto.produto_id;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const ocorrencia = produtosComOcorrencias[produtoId];

      return {
        produto_id: produtoId,
        descricao: produtoEstoque.produto.descricao,
        sku: produtoEstoque.produto.sku,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        qtd_esperada: ocorrencia?.qtd_esperada || produtoEstoque.quantidade,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        qtd_encontrada: ocorrencia?.qtd_sistema || produtoEstoque.quantidade,
        produto_com_ocorrencia: !!ocorrencia,
      };
    });

    // console.log(produtosComOcorrencias);
    // console.log(Object.keys(produtosComOcorrencias).length);

    return [
      {
        auditoria_id: auditoria.auditoria_id,
        armazem: ocorrencias[0].localizacao.armazem?.nome || null,
        localizacao: ocorrencias[0].localizacao?.nome || null,
        quantidade_ocorrencias: ocorrencias.length,
        total_produtos: produtosLocalizacao.length,
        produtos_com_ocorrencia: Object.keys(produtosComOcorrencias).length,
        produtos: produtosFormatados,
      },
    ];
  }
}
