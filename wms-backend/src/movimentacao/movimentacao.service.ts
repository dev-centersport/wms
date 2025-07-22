import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Movimentacao, TipoMovimentacao } from './entities/movimentacao.entity';
import { EntityManager, MoreThan, Repository } from 'typeorm';
import { Localizacao } from 'src/localizacao/entities/localizacao.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { ProdutoEstoque } from 'src/produto_estoque/entities/produto_estoque.entity';
import { ItemMovimentacao } from 'src/item_movimentacao/entities/item_movimentacao.entity';
import { CreateItemMovimentacaoDto } from 'src/item_movimentacao/dto/create-item_movimentacao.dto';
import { Produto } from 'src/produto/entities/produto.entity';

@Injectable()
export class MovimentacaoService {
  constructor(
    @InjectRepository(Movimentacao)
    private readonly movimentacaoRepository: Repository<Movimentacao>,
    @InjectRepository(ItemMovimentacao)
    private readonly itemMovimentacaoRepository: Repository<ItemMovimentacao>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Localizacao)
    private readonly localizacaoRepository: Repository<Localizacao>,
    @InjectRepository(ProdutoEstoque)
    private readonly produtoEstoqueRepository: Repository<ProdutoEstoque>,
    private readonly entityManager: EntityManager,
  ) {}

  async create(
    CreateMovimentacaoDto: CreateMovimentacaoDto,
  ): Promise<Movimentacao> {
    // Busca o usuário
    const usuario = await this.usuarioRepository.findOne({
      where: { usuario_id: CreateMovimentacaoDto.usuario_id },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuário com o ID ${CreateMovimentacaoDto.usuario_id} não encontrado`,
      );
    }

    // Busca as localizações
    const [localOrigem, localDestino] = await Promise.all([
      CreateMovimentacaoDto.localizacao_origem_id !== 0
        ? this.localizacaoRepository.findOne({
            where: {
              localizacao_id: CreateMovimentacaoDto.localizacao_origem_id,
            },
          })
        : Promise.resolve(null),
      CreateMovimentacaoDto.localizacao_destino_id !== 0
        ? this.localizacaoRepository.findOne({
            where: {
              localizacao_id: CreateMovimentacaoDto.localizacao_destino_id,
            },
          })
        : Promise.resolve(null),
    ]);

    // Lógica automática para transferência (se não houver itens especificados)
    if (
      CreateMovimentacaoDto.tipo === TipoMovimentacao.TRANSFERENCIA &&
      (!CreateMovimentacaoDto.itens_movimentacao ||
        CreateMovimentacaoDto.itens_movimentacao.length === 0)
    ) {
      const produtosEstoque = await this.produtoEstoqueRepository.find({
        where: {
          localizacao: {
            localizacao_id: CreateMovimentacaoDto.localizacao_origem_id,
          },
          quantidade: MoreThan(0), // Apenas produtos com estoque > 0
        },
        relations: ['produto'],
      });

      if (produtosEstoque.length === 0) {
        throw new BadRequestException(
          'Nenhum produto disponível para transferência na localização de origem',
        );
      }

      // Mapeia os produtos do estoque para os itens da movimentação
      CreateMovimentacaoDto.itens_movimentacao = produtosEstoque.map(
        (item) => ({
          produto_id: item.produto.produto_id,
          produto_estoque_id: item.produto.produto_id,
          quantidade: item.quantidade, // Transfere TODA a quantidade disponível
        }),
      );
    }

    // Validação padrão (garante que há itens)
    if (
      !CreateMovimentacaoDto.itens_movimentacao ||
      CreateMovimentacaoDto.itens_movimentacao.length === 0
    ) {
      throw new BadRequestException(
        'A movimentação deve conter pelo menos um item',
      );
    }

    // Validações específicas por tipo
    switch (CreateMovimentacaoDto.tipo) {
      case TipoMovimentacao.ENTRADA:
        if (CreateMovimentacaoDto.localizacao_origem_id !== 0) {
          throw new BadRequestException('Entrada não deve ter local de origem');
        }
        if (!localDestino) {
          throw new BadRequestException(
            'Local de destino é obrigatório para entrada',
          );
        }
        break;

      case TipoMovimentacao.SAIDA:
        if (!localOrigem) {
          throw new BadRequestException(
            'Local de origem é obrigatório para saída',
          );
        }
        if (CreateMovimentacaoDto.localizacao_destino_id !== 0) {
          throw new BadRequestException('Saída não deve ter local de destino');
        }
        break;

      case TipoMovimentacao.TRANSFERENCIA: {
        if (!localOrigem || !localDestino) {
          throw new BadRequestException(
            'Transferência requer origem e destino',
          );
        }
        if (localOrigem.localizacao_id === localDestino.localizacao_id) {
          throw new BadRequestException(
            'Origem e destino não podem ser iguais',
          );
        }

        // Lógica específica para transferência
        if (!localOrigem) {
          throw new BadRequestException(
            'Localização de origem é obrigatória para transferência',
          );
        }

        const produtosEstoque = await this.produtoEstoqueRepository.find({
          where: {
            localizacao: { localizacao_id: localOrigem.localizacao_id },
            quantidade: MoreThan(0),
          },
          relations: ['produto'],
        });

        // Se não houver produtos no estoque da origem
        if (produtosEstoque.length === 0) {
          throw new BadRequestException(
            'Nenhum produto encontrado na localização de origem para transferência',
          );
        }

        // Se o usuário não especificou produtos, transferir todos
        if (
          !CreateMovimentacaoDto.itens_movimentacao ||
          CreateMovimentacaoDto.itens_movimentacao.length === 0
        ) {
          CreateMovimentacaoDto.itens_movimentacao = produtosEstoque.map(
            (pe) => ({
              produto_estoque_id: pe.produto_estoque_id,
              produto_id: pe.produto.produto_id,
              produto_estoque_id: pe.produto.produto_id,
              quantidade: pe.quantidade,
            }),
          );
        } else {
          // Se o usuário especificou produtos, verificar se existem no estoque e pegar as quantidades disponíveis
          for (const item of CreateMovimentacaoDto.itens_movimentacao) {
            const produtoEstoque = produtosEstoque.find(
              (pe) => pe.produto.produto_id === item.produto_id,
            );

            if (!produtoEstoque) {
              throw new BadRequestException(
                `Produto com ID ${item.produto_id} não encontrado no estoque da localização de origem ou sem quantidade disponível`,
              );
            }

            // Se o usuário não especificou quantidade, usar a quantidade total disponível
            if (!item.quantidade) {
              item.quantidade = produtoEstoque.quantidade;
            } else if (item.quantidade > produtoEstoque.quantidade) {
              throw new BadRequestException(
                `Quantidade solicitada (${item.quantidade}) para o produto ${produtoEstoque.produto.descricao} excede a disponível (${produtoEstoque.quantidade}) na localização de origem`,
              );
            }
          }
        }
        break;
      }
    }

    // Validações de itens para todos os tipos de movimentação
    if (
      !CreateMovimentacaoDto.itens_movimentacao ||
      CreateMovimentacaoDto.itens_movimentacao.length === 0
    ) {
      throw new BadRequestException(
        'A movimentação deve conter pelo menos um item',
      );
    }

    return await this.entityManager.transaction(
      async (transactionalEntityManeger) => {
        const quantidadeTotal = CreateMovimentacaoDto.itens_movimentacao.reduce(
          (sum, item) => sum + item.quantidade,
          0,
        );

        const movimentacaoData = Object.assign(
          {},
          {
            tipo: CreateMovimentacaoDto.tipo,
            usuario: usuario,
            quantidade: quantidadeTotal,
          },
          CreateMovimentacaoDto.localizacao_origem_id !== 0
            ? {
                localizacao_origem: {
                  localizacao_id: CreateMovimentacaoDto.localizacao_origem_id,
                },
              }
            : {},
          CreateMovimentacaoDto.localizacao_destino_id !== 0
            ? {
                localizacao_destino: {
                  localizacao_id: CreateMovimentacaoDto.localizacao_destino_id,
                },
              }
            : {},
        );

        const movimentacao =
          this.movimentacaoRepository.create(movimentacaoData);

        const movimentacaoSalva =
          await transactionalEntityManeger.save(movimentacao);

        for (const itemDto of CreateMovimentacaoDto.itens_movimentacao) {
          await this.processarItemMovimentacao(
            movimentacaoSalva,
            itemDto,
            transactionalEntityManeger,
          );
        }

        const movimentacaoComRelacoes =
          await transactionalEntityManeger.findOne(Movimentacao, {
            where: { movimentacao_id: movimentacaoSalva.movimentacao_id },
            relations: [
              'usuario',
              'localizacao_origem',
              'localizacao_destino',
              'itens_movimentacao.produto',
            ],
          });

        if (!movimentacaoComRelacoes) {
          throw new Error('Movimentação não encontrada após criação');
        }

        return movimentacaoComRelacoes;
      },
    );
  }

  private async processarItemMovimentacao(
    movimentacao: Movimentacao,
    itemDto: CreateItemMovimentacaoDto,
    entityManager: EntityManager,
  ): Promise<void> {
    if (itemDto.quantidade <= 0) {
      throw new BadRequestException('Quantidade deve ser positiva');
    }

    const produto = await entityManager.findOne(Produto, {
      where: { produto_id: itemDto.produto_id },
    });
    if (!produto) throw new NotFoundException('Produto não encontrado');

    // Se for transferência automática, não valida quantidade (já veio do estoque)
    if (
      movimentacao.tipo !== TipoMovimentacao.TRANSFERENCIA &&
      itemDto.quantidade <= 0
    ) {
      throw new BadRequestException('Quantidade deve ser positiva');
    }

    const itemMovimentacao = this.itemMovimentacaoRepository.create({
      movimentacao,
      produto,
      quantidade: itemDto.quantidade,
    });

    await entityManager.save(itemMovimentacao);

    let localizacao_estoque: Localizacao | null = null;

    if (movimentacao.tipo === TipoMovimentacao.ENTRADA) {
      localizacao_estoque = movimentacao.localizacao_destino;
    } else if (movimentacao.tipo === TipoMovimentacao.SAIDA) {
      localizacao_estoque = movimentacao.localizacao_origem;
    }

    let produto_estoque = await entityManager.findOne(ProdutoEstoque, {
      where: {
        produto: { produto_id: produto.produto_id },
        localizacao: localizacao_estoque
          ? { localizacao_id: localizacao_estoque.localizacao_id }
          : undefined,
      },
      relations: ['produto', 'localizacao'],
    });

    if (
      !produto_estoque &&
      movimentacao.tipo === TipoMovimentacao.ENTRADA &&
      localizacao_estoque
    ) {
      produto_estoque = entityManager.create(ProdutoEstoque, {
        produto,
        localizacao: localizacao_estoque,
        quantidade: 0,
      });
    }

    if (!produto_estoque) {
      throw new BadRequestException(
        `Produto não encontrado no estoque da localização ${localizacao_estoque?.nome}`,
      );
    }

    await this.atualizarEstoque(
      movimentacao.tipo,
      produto_estoque,
      itemDto.quantidade,
      movimentacao.localizacao_origem,
      movimentacao.localizacao_destino,
      entityManager,
    );
  }

  private async atualizarEstoque(
    tipo: TipoMovimentacao,
    produtoEstoqueOrigem: ProdutoEstoque, // Usado apenas para ENTRADA/SAÍDA
    quantidade: number, // Usado apenas para ENTRADA/SAÍDA
    localizacaoOrigem: Localizacao | null,
    localizacaoDestino: Localizacao | null,
    entityManager: EntityManager,
  ): Promise<void> {
    await entityManager.transaction(async (transactionalEntityManager) => {
      switch (tipo) {
        case TipoMovimentacao.ENTRADA:
          // Mantido igual: adiciona quantidade ao estoque
          produtoEstoqueOrigem.quantidade += quantidade;
          await transactionalEntityManager.save(
            ProdutoEstoque,
            produtoEstoqueOrigem,
          );
          break;

        case TipoMovimentacao.SAIDA:
          // Mantido igual: remove quantidade do estoque (se houver saldo)
          if (produtoEstoqueOrigem.quantidade < quantidade) {
            throw new BadRequestException('Estoque insuficiente');
          }
          produtoEstoqueOrigem.quantidade -= quantidade;
          await transactionalEntityManager.save(
            ProdutoEstoque,
            produtoEstoqueOrigem,
          );
          break;

        case TipoMovimentacao.TRANSFERENCIA: {
          if (!localizacaoOrigem || !localizacaoDestino) {
            throw new BadRequestException(
              'Origem e destino são obrigatórios para transferência',
            );
          }

          // Busca TODOS os produtos no estoque de origem
          const produtosEstoqueOrigem = await transactionalEntityManager.find(
            ProdutoEstoque,
            {
              where: {
                localizacao: {
                  localizacao_id: localizacaoOrigem.localizacao_id,
                },
                // quantidade: MoreThan(0), // Apenas produtos com quantidade > 0
              },
              relations: ['produto'],
            },
          );

          if (!produtosEstoqueOrigem || produtosEstoqueOrigem.length === 0) {
            throw new BadRequestException(
              'Nenhum produto encontrado no estoque de origem',
            );
          }

          // Para cada produto no estoque de origem
          for (const produtoEstoqueOrigem of produtosEstoqueOrigem) {
            // Busca o estoque no destino (ou cria se não existir)
            let produtoEstoqueDestino =
              await transactionalEntityManager.findOne(ProdutoEstoque, {
                where: {
                  produto: {
                    produto_id: produtoEstoqueOrigem.produto.produto_id,
                  },
                  localizacao: {
                    localizacao_id: localizacaoDestino.localizacao_id,
                  },
                },
              });

            if (!produtoEstoqueDestino) {
              produtoEstoqueDestino = transactionalEntityManager.create(
                ProdutoEstoque,
                {
                  produto: produtoEstoqueOrigem.produto,
                  localizacao: localizacaoDestino,
                  quantidade: 0,
                },
              );
            }

            // Transfere TODA a quantidade disponível
            produtoEstoqueDestino.quantidade += produtoEstoqueOrigem.quantidade;
            produtoEstoqueOrigem.quantidade = 0; // Zera o estoque de origem

            await transactionalEntityManager.save(produtoEstoqueDestino);
            await transactionalEntityManager.save(produtoEstoqueOrigem);
          }
          break;
        }
      }
    });
  }

  async findAll(): Promise<Movimentacao[]> {
    return await this.movimentacaoRepository.find({
      relations: [
        'usuario',
        'localizacao_origem',
        'localizacao_destino',
        'itens_movimentacao.produto',
      ],
    });
  }

  async findOne(movimentacao_id: number): Promise<Movimentacao> {
    const movimentacao = await this.movimentacaoRepository.findOne({
      where: { movimentacao_id },
      relations: [
        'usuario',
        'localizacao_origem',
        'localizacao_destino',
        'itens_movimentacao.produto',
      ],
    });

    if (!movimentacao) {
      throw new NotFoundException(
        `Movimentação com ID ${movimentacao_id} não encontrado`,
      );
    }

    return movimentacao;
  }
}
