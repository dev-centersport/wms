import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLocalizacaoDto } from './dto/create-localizacao.dto';
import { UpdateLocalizacaoDto } from './dto/update-localizacao.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Localizacao, StatusPrateleira } from './entities/localizacao.entity';
import { Brackets, FindManyOptions, Repository } from 'typeorm';
import { TipoLocalizacao } from 'src/tipo_localizacao/entities/tipo_localizacao.entity';
import { Armazem } from 'src/armazem/entities/armazem.entity';
import { EAN13Generator } from 'src/utils/ean13.generator';

@Injectable()
export class LocalizacaoService {
  constructor(
    @InjectRepository(Localizacao)
    private readonly LocalizacaoRepository: Repository<Localizacao>,
    @InjectRepository(TipoLocalizacao)
    private readonly tipoLocalizacaoRepository: Repository<TipoLocalizacao>,
    @InjectRepository(Armazem)
    private readonly armazemRepository: Repository<Armazem>,
  ) {}

  async getProdutosPorLocalizacao(localizacao_id: number) {
    return await this.LocalizacaoRepository.findOne({
      where: { localizacao_id: localizacao_id },
      relations: {
        produtos_estoque: {
          produto: true,
        },
      },
      select: {
        localizacao_id: true,
        nome: true,
        produtos_estoque: {
          produto_estoque_id: true, // ou produtos_estoque_id se for o nome da coluna PK
          quantidade: true,
          produto: {
            produto_id: true,
            descricao: true,
            sku: true,
            ean: true,
          },
        },
      },
    });
  }

  // async findAll(): Promise<any[]> {
  //   const localizacoes = await this.LocalizacaoRepository.createQueryBuilder(
  //     'localizacao',
  //   )
  //     .leftJoin('localizacao.produtos_estoque', 'estoque')
  //     .leftJoinAndSelect('localizacao.tipo', 'tipo')
  //     .leftJoinAndSelect('localizacao.armazem', 'armazem')
  //     .select([
  //       'localizacao',
  //       'tipo',
  //       'armazem',
  //       'SUM(estoque.quantidade) as total_produtos',
  //     ])
  //     .groupBy('localizacao.localizacao_id')
  //     .addGroupBy('tipo.tipo_localizacao_id') // ajuste conforme o nome da PK do tipo
  //     .addGroupBy('armazem.armazem_id') // ajuste conforme o nome da PK do armazem
  //     .orderBy('total_produtos', 'DESC')
  //     .orderBy('localizacao.nome', 'ASC')
  //     .getRawAndEntities();

  //   // Combina os dados das entidades com os dados raw (incluindo a soma)
  //   return localizacoes.entities.map((localizacao, index) => ({
  //     ...localizacao,
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  //     total_produtos: parseFloat(localizacoes.raw[index].total_produtos) || 0,
  //   }));
  // }

  async search(
    search?: string,
    offset = 0,
    limit = 50,
    status?: StatusPrateleira,
    armazemId?: number,
    tipoId?: number,
  ): Promise<{ results: any[]; total: number }> {
    const query = this.LocalizacaoRepository.createQueryBuilder('localizacao')
      .leftJoin('localizacao.produtos_estoque', 'estoque')
      .leftJoinAndSelect('localizacao.tipo', 'tipo')
      .leftJoinAndSelect('localizacao.armazem', 'armazem')
      .select([
        'localizacao',
        'tipo',
        'armazem',
        'SUM(estoque.quantidade) as total_produtos',
      ])
      .groupBy('localizacao.localizacao_id')
      .addGroupBy('tipo.tipo_localizacao_id')
      .addGroupBy('armazem.armazem_id');

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('localizacao.nome ILIKE :search', {
            search: `%${search}%`,
          }).orWhere('localizacao.ean ILIKE :search', {
            search: `%${search}%`,
          });
        }),
      );
    }

    if (status) {
      query.andWhere('localizacao.status = :status', { status });
    }
    if (armazemId) {
      query.andWhere('armazem.armazem_id = :armazemId', { armazemId });
    }
    if (tipoId) {
      query.andWhere('tipo.tipo_localizacao_id = :tipoId', { tipoId });
    }

    // total para paginação
    const total = await query.getCount();

    // Paginação e ordenação
    query
      // .orderBy('total_produtos', 'DESC')
      .addOrderBy('localizacao.nome', 'ASC')
      .offset(offset)
      .limit(limit);

    const { entities, raw } = await query.getRawAndEntities();

    const results = entities.map((localizacao, index) => ({
      ...localizacao,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      total_produtos: parseFloat(raw[index].total_produtos) || 0,
    }));

    return { results, total };
  }

  async findOne(localizacao_id: number): Promise<Localizacao> {
    const localizacao = await this.LocalizacaoRepository.findOne({
      where: { localizacao_id },
      relations: ['tipo', 'armazem'],
    });

    if (!localizacao) {
      throw new NotFoundException(
        `Armazém com ID ${localizacao_id} não encontrado`,
      );
    }

    return localizacao;
  }

  async encontrarLocalizacaoPorEan(ean: string) {
    const localizacao = await this.LocalizacaoRepository.findOne({
      where: { ean: ean },
      relations: ['armazem'],
    });

    if (!localizacao) {
      throw new NotFoundException(`Localização com EAN ${ean} não encontrado`);
    }

    return {
      localizacao_id: localizacao.localizacao_id,
      localizacao_nome: localizacao.nome,
      ean: localizacao.ean,
      armazem_nome: localizacao.armazem.nome,
    };
  }

  async create(
    createLocalizacaoDto: CreateLocalizacaoDto,
  ): Promise<Localizacao> {
    // Verifica se tipo existe
    const [armazem, tipo] = await Promise.all([
      this.armazemRepository.findOne({
        where: { armazem_id: createLocalizacaoDto.armazem_id },
      }),
      this.tipoLocalizacaoRepository.findOne({
        where: {
          tipo_localizacao_id: createLocalizacaoDto.tipo_localizacao_id,
        },
      }),
    ]);
    if (!tipo)
      throw new NotFoundException('Tipo de localização não encontrado');
    if (!armazem)
      throw new NotFoundException('Armazem de localização não encontrado');

    const localizacaoExistente = await this.LocalizacaoRepository.findOne({
      where: {
        nome: createLocalizacaoDto.nome,
        armazem: { armazem_id: createLocalizacaoDto.armazem_id }, // Assumindo que há um relacionamento
        tipo: { tipo_localizacao_id: createLocalizacaoDto.tipo_localizacao_id },
      },
    });

    if (localizacaoExistente) {
      throw new BadRequestException(
        'Já existe uma localização com este nome no mesmo armazém.',
      );
    }

    // Verifica se o armazém existe
    // const armazem = await this.armazemRepository.findOneBy({});
    // if (!armazem) {
    //   throw new NotFoundException('Armazém não encontrado');
    // }

    // Gerando ean unico e valido
    const ean = await EAN13Generator.generateUniqueEAN(
      armazem.armazem_id,
      tipo.tipo_localizacao_id,
      this.LocalizacaoRepository,
    );
    const exists = await this.LocalizacaoRepository.findOneBy({ ean });
    if (exists) {
      throw new Error('EAN já existe. Tente novamente');
    }

    const localizacao = this.LocalizacaoRepository.create({
      ...createLocalizacaoDto,
      tipo,
      armazem,
      ean,
    });

    return await this.LocalizacaoRepository.save(localizacao);
  }

  async update(
    localizacao_id: number,
    updateLocalizacaoDto: UpdateLocalizacaoDto,
  ): Promise<Localizacao> {
    const localizacao = await this.findOne(localizacao_id);

    if (!localizacao) throw new NotFoundException('Localizção não encontrada!');

    if (updateLocalizacaoDto.armazem_id !== undefined) {
      const armazem = await this.armazemRepository.findOneBy({
        armazem_id: updateLocalizacaoDto.armazem_id,
      });
      if (!armazem) throw new NotFoundException('Armazém não encontrado');
      localizacao.armazem = armazem;
    }
    if (updateLocalizacaoDto.tipo_localizacao_id !== undefined) {
      const tipo_localizacao = await this.tipoLocalizacaoRepository.findOneBy({
        tipo_localizacao_id: updateLocalizacaoDto.tipo_localizacao_id,
      });
      if (!tipo_localizacao)
        throw new NotFoundException('Tipo de localização não encontrado');
      localizacao.tipo = tipo_localizacao;
    }

    // this.LocalizacaoRepository.merge(localizacao, updateLocalizacaoDto);
    const { armazem_id, tipo_localizacao_id, ...camposSimples } =
      updateLocalizacaoDto;

    Object.assign(localizacao, camposSimples);

    return await this.LocalizacaoRepository.save(localizacao);
  }

  async remove(localizacao_id: number): Promise<void> {
    const localizacao = await this.findOne(localizacao_id);

    await this.LocalizacaoRepository.remove(localizacao);
  }
}
