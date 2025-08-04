import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProdutoEstoqueDto } from './dto/create-produto_estoque.dto';
import { UpdateProdutoEstoqueDto } from './dto/update-produto_estoque.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProdutoEstoque } from './entities/produto_estoque.entity';
import { Brackets, MoreThan, Repository } from 'typeorm';
import { Produto } from 'src/produto/entities/produto.entity';
import { Localizacao } from 'src/localizacao/entities/localizacao.entity';

@Injectable()
export class ProdutoEstoqueService {
  constructor(
    @InjectRepository(ProdutoEstoque)
    private readonly ProdutoEstoqueRepository: Repository<ProdutoEstoque>,
    @InjectRepository(Produto)
    private readonly ProdutoRepository: Repository<Produto>,
    @InjectRepository(Localizacao)
    private readonly LocalizacaoRepository: Repository<Localizacao>,
  ) {}

  async findAll(): Promise<ProdutoEstoque[]> {
    return await this.ProdutoEstoqueRepository.find({
      where: { quantidade: MoreThan(0) },
      relations: ['produto', 'localizacao.armazem', 'localizacao.tipo'],
    });
  }

  async listarTudo(): Promise<ProdutoEstoque[]> {
    return await this.ProdutoEstoqueRepository.find({
      relations: ['produto', 'localizacao.armazem', 'localizacao.tipo'],
    });
  }

  async findOne(produto_estoque_id: number): Promise<ProdutoEstoque> {
    const produto_estoque = await this.ProdutoEstoqueRepository.findOne({
      where: { produto_estoque_id },
      relations: ['produto', 'localizacao'],
    });

    if (!produto_estoque)
      throw new NotFoundException(
        `Produto estoque com ID ${produto_estoque_id} não encontrado`,
      );

    return produto_estoque;
  }

  async search(
    search?: string,
    offset = 0,
    limit = 30,
    tipoId?: number,
    armazemId?: number,
    relatorio: boolean = false,
  ): Promise<{ results: any[] }> {
    if (relatorio) {
      // Para relatórios, buscar todos os produtos
      console.log('Gerando relatório com todos os produtos...');
      console.log('Parâmetros recebidos:', { search, offset, limit, tipoId, armazemId, relatorio });
      
      const todosProdutos = await this.ProdutoRepository.find();
      console.log('Total de produtos para relatório:', todosProdutos.length);

      // Buscar produtos com estoque
      const produtosComEstoque = await this.ProdutoEstoqueRepository.find({
        relations: ['produto', 'localizacao.tipo', 'localizacao.armazem'],
      });
      console.log('Produtos com estoque encontrados:', produtosComEstoque.length);

      // Criar um mapa para facilitar a busca de produtos com estoque
      const mapaProdutosComEstoque = new Map();
      produtosComEstoque.forEach(item => {
        if (item.produto?.produto_id) {
          mapaProdutosComEstoque.set(item.produto.produto_id, item);
        }
      });
      console.log('Mapa de produtos com estoque criado com', mapaProdutosComEstoque.size, 'itens');

      // Processar todos os produtos para o relatório
      const results = todosProdutos.map((produto) => {
        const produtoComEstoque = mapaProdutosComEstoque.get(produto.produto_id);
        
        if (produtoComEstoque) {
          // Produto tem estoque em alguma localização
          console.log(`Produto ${produto.produto_id} (${produto.descricao}) tem estoque: ${produtoComEstoque.quantidade} em ${produtoComEstoque.localizacao?.nome}`);
          return {
            produto_estoque_id: produtoComEstoque.produto_estoque_id,
            quantidade: produtoComEstoque.quantidade,
            produto: produtoComEstoque.produto,
            localizacao: produtoComEstoque.localizacao,
          };
        } else {
          // Produto não tem estoque em nenhuma localização
          console.log(`Produto ${produto.produto_id} (${produto.descricao}) SEM estoque - quantidade: 0, localização: null`);
          return {
            produto_estoque_id: null,
            quantidade: 0,
            produto: produto,
            localizacao: null,
          };
        }
      });

      console.log('Relatório final gerado com', results.length, 'produtos');
      console.log('Produtos com estoque no relatório:', results.filter(r => r.quantidade > 0).length);
      console.log('Produtos sem estoque no relatório:', results.filter(r => r.quantidade === 0).length);

      return { results };
    }

    // Lógica original para busca normal (não relatório)
    const query = this.ProdutoEstoqueRepository.createQueryBuilder(
      'produto_estoque',
    )
      .leftJoin('produto_estoque.produto', 'produto')
      .leftJoin('produto_estoque.localizacao', 'localizacao')
      .leftJoin('localizacao.tipo', 'tipo')
      .leftJoin('localizacao.armazem', 'armazem')
      .select(['produto_estoque', 'produto', 'localizacao', 'armazem'])
      .groupBy('produto_estoque.produto_estoque_id')
      .addGroupBy('produto.produto_id')
      .addGroupBy('localizacao.localizacao_id')
      .addGroupBy('tipo.tipo_localizacao_id')
      .addGroupBy('armazem.armazem_id');

    query.where('produto_estoque.quantidade > 0');

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('produto.descricao ILIKE :search', {
            search: `%${search}%`,
          })
            .orWhere('produto.ean ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('produto.sku ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('localizacao.nome ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('localizacao.ean ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('tipo.tipo ILIKE :search', {
              search: `%${search}%`,
            })
            .orWhere('armazem.nome ILIKE :search', {
              search: `%${search}%`,
            });
        }),
      );
    }

    if (tipoId)
      query.andWhere('tipo.tipo_localizacao_id = :tipoId', { tipoId });
    if (armazemId)
      query.andWhere('armazem.armazem_id = :armazemId', { armazemId });

    // const total = await query.getCount();

    query.addOrderBy('localizacao.nome', 'ASC').offset(offset).limit(limit);

    const entities = await query.getRawAndEntities();

    const results = entities.entities.map((produto_estoque) => ({
      ...produto_estoque,
    }));

    return { results };
  }

  async relatorioConsulta(): Promise<any> {
    console.log('Iniciando relatorioConsulta CORRIGIDO...');
    
    try {
      // Buscar todos os produtos primeiro
      const todosProdutos = await this.ProdutoRepository.find({
        order: { produto_id: 'ASC' }
      });
      console.log('Total de produtos cadastrados:', todosProdutos.length);

      // Buscar TODOS os registros de produto_estoque (com e sem estoque)
      const todosProdutosEstoque = await this.ProdutoEstoqueRepository.find({
        relations: ['produto', 'localizacao.tipo', 'localizacao.armazem'],
      });
      console.log('Total de registros de produto_estoque encontrados:', todosProdutosEstoque.length);

      // Criar um mapa para facilitar a busca de produtos com estoque > 0
      const mapaProdutosComEstoque = new Map();
      todosProdutosEstoque.forEach(item => {
        console.log(`Verificando produto ${item.produto?.produto_id}: quantidade=${item.quantidade}, localização=${item.localizacao?.nome}`);
        if (item.produto?.produto_id && item.quantidade > 0) {
          // Se já existe um produto com estoque, mantém o que tem maior quantidade
          const existente = mapaProdutosComEstoque.get(item.produto.produto_id);
          if (!existente || item.quantidade > existente.quantidade) {
            mapaProdutosComEstoque.set(item.produto.produto_id, item);
            console.log(`Adicionado ao mapa: produto ${item.produto.produto_id} com quantidade ${item.quantidade}`);
          }
        }
      });
      console.log('Produtos com estoque > 0 encontrados:', mapaProdutosComEstoque.size);

      // Criar um Set para controlar produtos já processados e evitar duplicatas
      const produtosProcessados = new Set();

      // Processar todos os produtos (sem duplicatas)
      const result: any[] = [];
      
      for (const produto of todosProdutos) {
        // Verificar se o produto já foi processado
        if (produtosProcessados.has(produto.produto_id)) {
          console.log(`Produto ${produto.produto_id} já foi processado, pulando...`);
          continue;
        }
        
        const produtoComEstoque = mapaProdutosComEstoque.get(produto.produto_id);
        
        if (produtoComEstoque && produtoComEstoque.quantidade > 0) {
          // Produto tem estoque > 0 em alguma localização
          console.log(`Produto ${produto.produto_id} (${produto.descricao}) tem estoque: ${produtoComEstoque.quantidade} em ${produtoComEstoque.localizacao?.nome || 'sem localização'}`);
          const resultItem = {
            localizacao: {
              armazem_id: produtoComEstoque.localizacao?.armazem?.armazem_id || null,
              armazem: produtoComEstoque.localizacao?.armazem?.nome || '',
              localizacao_id: produtoComEstoque.localizacao?.localizacao_id || null,
              nome: produtoComEstoque.localizacao?.nome || '',
              ean: produtoComEstoque.localizacao?.ean || '',
              tipo: produtoComEstoque.localizacao?.tipo?.tipo || '',
            },
            produto: {
              id_tiny: produto.id_tiny,
              produto_id: produto.produto_id,
              descricao: produto.descricao,
              sku: produto.sku,
              ean: produto.ean,
            },
            quantidade: produtoComEstoque.quantidade,
          };
          console.log(`Resultado para produto ${produto.produto_id}: quantidade=${resultItem.quantidade}, localização=${resultItem.localizacao.nome}`);
          result.push(resultItem);
        } else {
          // Produto não tem estoque > 0 em nenhuma localização (saldo = 0)
          console.log(`Produto ${produto.produto_id} (${produto.descricao}) SEM estoque - quantidade: 0, localização: vazia`);
          const resultItem = {
            localizacao: {
              armazem_id: null,
              armazem: '',
              localizacao_id: null,
              nome: '',
              ean: '',
              tipo: '',
            },
            produto: {
              id_tiny: produto.id_tiny,
              produto_id: produto.produto_id,
              descricao: produto.descricao,
              sku: produto.sku,
              ean: produto.ean,
            },
            quantidade: 0,
          };
          console.log(`Resultado para produto ${produto.produto_id}: quantidade=${resultItem.quantidade}, localização=${resultItem.localizacao.nome}`);
          result.push(resultItem);
        }
        
        // Marcar produto como processado
        produtosProcessados.add(produto.produto_id);
      }

      console.log('Relatório gerado com sucesso, total de itens:', result.length);
      console.log('Produtos com estoque > 0:', result.filter(r => r.quantidade > 0).length);
      console.log('Produtos com saldo 0:', result.filter(r => r.quantidade === 0).length);
      console.log('Produtos com localização vazia:', result.filter(r => !r.localizacao.nome).length);
      return result;
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw error;
    }
  }

  async create(
    createProdutoEstoqueDto: CreateProdutoEstoqueDto,
  ): Promise<ProdutoEstoque> {
    const [produto, localizacao] = await Promise.all([
      this.ProdutoRepository.findOne({
        where: { produto_id: createProdutoEstoqueDto.produto_id },
      }),
      this.LocalizacaoRepository.findOne({
        where: { localizacao_id: createProdutoEstoqueDto.localizacao_id },
      }),
    ]);

    if (!produto) throw new NotFoundException('Produto não encontrado');
    if (!localizacao) throw new NotFoundException('Localizacao não encontrado');

    // Verifica se já existe um registro para este produto e localização
    const produtoEstoqueExistente = await this.ProdutoEstoqueRepository.findOne(
      {
        where: {
          localizacao: {
            localizacao_id: createProdutoEstoqueDto.localizacao_id,
          },
          produto: { produto_id: createProdutoEstoqueDto.produto_id },
        },
        relations: ['localizacao', 'localizacao.armazem'],
      },
    );

    let produto_estoque: ProdutoEstoque;

    if (produtoEstoqueExistente) {
      // Se existir, atualiza a quantidade
      produtoEstoqueExistente.quantidade += createProdutoEstoqueDto.quantidade;
      produto_estoque = produtoEstoqueExistente;
    } else {
      // Se não existir, cria um novo registro
      produto_estoque = this.ProdutoEstoqueRepository.create({
        ...createProdutoEstoqueDto,
        produto,
        localizacao,
      });
    }

    return await this.ProdutoEstoqueRepository.save(produto_estoque);
  }

  async update(
    produto_estoque_id: number,
    updateProdutoEstoqueDto: UpdateProdutoEstoqueDto,
  ): Promise<ProdutoEstoque> {
    const produtoEstoque = await this.findOne(produto_estoque_id);
    if (!produtoEstoque) {
      throw new NotFoundException('Produto estoque não encontrado!');
    }

    // Atualiza as relações se necessário
    if (updateProdutoEstoqueDto.produto_id !== undefined) {
      const produto = await this.ProdutoRepository.findOneBy({
        produto_id: updateProdutoEstoqueDto.produto_id,
      });
      if (!produto) throw new NotFoundException('Produto não encontrado');
      produtoEstoque.produto = produto;
    }

    if (updateProdutoEstoqueDto.localizacao_id !== undefined) {
      const localizacao = await this.LocalizacaoRepository.findOneBy({
        localizacao_id: updateProdutoEstoqueDto.localizacao_id,
      });
      if (!localizacao)
        throw new NotFoundException('Localização não encontrada');
      produtoEstoque.localizacao = localizacao;
    }

    // Atualiza os campos simples (quantidade, etc.)
    const { produto_id, localizacao_id, ...camposSimples } =
      updateProdutoEstoqueDto;
    Object.assign(produtoEstoque, camposSimples);

    return await this.ProdutoEstoqueRepository.save(produtoEstoque);
  }

  async remove(produto_estoque_id: number): Promise<void> {
    const produto_estoque = await this.findOne(produto_estoque_id);

    await this.ProdutoEstoqueRepository.remove(produto_estoque);
  }
  // create(createProdutoEstoqueDto: CreateProdutoEstoqueDto) {
  //   return 'This action adds a new produtoEstoque';
  // }
  // findAll() {
  //   return `This action returns all produtoEstoque`;
  // }
  // findOne(id: number) {
  //   return `This action returns a #${id} produtoEstoque`;
  // }
  // update(id: number, updateProdutoEstoqueDto: UpdateProdutoEstoqueDto) {
  //   return `This action updates a #${id} produtoEstoque`;
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} produtoEstoque`;
  // }
}
