import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Movimentacao, TipoMovimentacao } from './entities/movimentacao.entity';
import { EntityManager, Repository } from 'typeorm';
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
    private readonly entityManager: EntityManager,
  ) {}

  async create(
    CreateMovimentacaoDto: CreateMovimentacaoDto,
  ): Promise<Movimentacao> {
    // Validações de itens
    if (
      !CreateMovimentacaoDto.itens_movimentacao ||
      CreateMovimentacaoDto.itens_movimentacao.length === 0
    ) {
      throw new BadRequestException(
        'A movimentação deve conter pelo menos um item',
      );
    }

    // Busca o usuário
    const usuario = await this.usuarioRepository.findOne({
      where: { usuario_id: CreateMovimentacaoDto.usuario_id },
    });

    if (!usuario)
      throw new NotFoundException(
        `Usuário com o ID ${CreateMovimentacaoDto.usuario_id} não encontrado`,
      );

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

      case TipoMovimentacao.TRANSFERENCIA:
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
        break;
    }

    return await this.entityManager.transaction(
      async (transactionalEntityManeger) => {
        const quantidadeTotal = CreateMovimentacaoDto.itens_movimentacao.reduce(
          (sum, item) => sum + item.quantidade,
          0,
        );

        // Criando pelo Object.assign
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

        // Then create the entity with the repository
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

        if (!movimentacaoComRelacoes)
          throw new Error('Movimentação não encontrada após criação');

        return movimentacaoComRelacoes;
      },
    );
  }

  private async processarItemMovimentacao(
    movimentacao: Movimentacao,
    itemDto: CreateItemMovimentacaoDto,
    entityManager: EntityManager,
  ): Promise<void> {
    // Validar item
    if (itemDto.quantidade <= 0)
      throw new BadRequestException('Quantidade deve ser positiva');

    // Buscar produto
    const produto = await entityManager.findOne(Produto, {
      where: { produto_id: itemDto.produto_id },
      // relations: ['localizacao'],
    });
    if (!produto) throw new NotFoundException('Produto não encontrado');

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

    // Buscar ou criar o produto no estoque
    let produto_estoque = await entityManager.findOne(ProdutoEstoque, {
      where: {
        produto: { produto_id: produto.produto_id },
        localizacao: localizacao_estoque
          ? { localizacao_id: localizacao_estoque.localizacao_id }
          : undefined,
      },
      relations: ['produto', 'localizacao'],
    });

    // Se não existe e é uma entrada, cria um novo registro
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

    if (!produto_estoque)
      throw new BadRequestException(
        `Produto não encontrado no estoque da localização ${localizacao_estoque?.nome}`,
      );

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
    produtoEstoqueOrigem: ProdutoEstoque,
    quantidade: number,
    localizacaoOrigem: Localizacao | null,
    localizacaoDestino: Localizacao | null,
    entityManager: EntityManager,
  ): Promise<void> {
    switch (tipo) {
      case TipoMovimentacao.ENTRADA:
        // Apenas incrementa no destino (já que é uma entrada)
        produtoEstoqueOrigem.quantidade += quantidade;
        await entityManager.save(ProdutoEstoque, produtoEstoqueOrigem);
        break;

      case TipoMovimentacao.SAIDA:
        // Valida e decrementa da origem
        if (produtoEstoqueOrigem.quantidade < quantidade) {
          throw new BadRequestException('Estoque insuficiente');
        }
        produtoEstoqueOrigem.quantidade -= quantidade;
        await entityManager.save(ProdutoEstoque, produtoEstoqueOrigem);
        break;

      case TipoMovimentacao.TRANSFERENCIA: {
        // Valida origem
        if (produtoEstoqueOrigem.quantidade < quantidade) {
          throw new BadRequestException(
            'Estoque insuficiente para transferência',
          );
        }

        // Garante que localizacaoDestino não é nulo
        if (!localizacaoDestino) {
          throw new BadRequestException(
            'Localização de destino não pode ser nula para transferência',
          );
        }

        // Busca ou cria estoque no destino
        let produtoEstoqueDestino = await entityManager.findOne(
          ProdutoEstoque,
          {
            where: {
              produto: { produto_id: produtoEstoqueOrigem.produto.produto_id },
              localizacao: {
                localizacao_id: localizacaoDestino.localizacao_id,
              },
            },
          },
        );

        if (!produtoEstoqueDestino) {
          produtoEstoqueDestino = entityManager.create(ProdutoEstoque, {
            produto: produtoEstoqueOrigem.produto,
            localizacao: localizacaoDestino,
            quantidade: 0,
          });
        }

        // Atualiza ambos os estoques
        produtoEstoqueOrigem.quantidade -= quantidade;
        produtoEstoqueDestino.quantidade += quantidade;

        await Promise.all([
          entityManager.save(ProdutoEstoque, produtoEstoqueOrigem),
          entityManager.save(ProdutoEstoque, produtoEstoqueDestino),
        ]);
        break;
      }
    }
  }

  async findAll(): Promise<Movimentacao[]> {
    return await this.movimentacaoRepository.find({
      relations: [
        'usuario',
        'localizacao_origem',
        'localizacao_destino',
        'itens_movimentacao.produto_estoque.produto',
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
        'itens_movimentacao.produto_estoque.produto',
      ],
    });

    if (!movimentacao)
      throw new NotFoundException(
        `Movimentação com ID ${movimentacao_id} não encontrado`,
      );

    return movimentacao;
  }
  // async create(
  //   CreateMovimentacaoDto: CreateMovimentacaoDto,
  // ): Promise<Movimentacao> {
  //   // Validações básicas (como no seu código original)
  //   if (CreateMovimentacaoDto.quantidade <= 0) {
  //     throw new BadRequestException('A quantidade deve ser maior que zero');
  //   }

  //   // Busca o usuário
  //   const usuario = await this.usuarioRepository.findOne({
  //     where: { usuario_id: CreateMovimentacaoDto.usuario_id },
  //   });

  //   if (!usuario) {
  //     throw new NotFoundException(
  //       `Usuário com o ID ${CreateMovimentacaoDto.usuario_id} não encontrado`,
  //     );
  //   }

  //   // Validação do tipo de movimentação (como no seu código original)
  //   // ... (código de validação do tipo de movimentação)

  //   // Busca as localizações
  //   const [localOrigem, localDestino] = await Promise.all([
  //     CreateMovimentacaoDto.localizacao_origem_id !== 0
  //       ? this.localizacaoRepository.findOne({
  //           where: {
  //             localizacao_id: CreateMovimentacaoDto.localizacao_origem_id,
  //           },
  //         })
  //       : Promise.resolve(null),
  //     CreateMovimentacaoDto.localizacao_destino_id !== 0
  //       ? this.localizacaoRepository.findOne({
  //           where: {
  //             localizacao_id: CreateMovimentacaoDto.localizacao_destino_id,
  //           },
  //         })
  //       : Promise.resolve(null),
  //   ]);

  //   // Valida as localizações encontradas
  //   if (CreateMovimentacaoDto.localizacao_origem_id !== 0 && !localOrigem) {
  //     throw new NotFoundException('Localização de origem não encontrada');
  //   }

  //   if (CreateMovimentacaoDto.localizacao_destino_id !== 0 && !localDestino) {
  //     throw new NotFoundException('Localização de destino não encontrada');
  //   }

  //   // Criação da movimentação
  //   const movimentacao = this.movimentacaoRepository.create({
  //     ...CreateMovimentacaoDto,
  //     usuario,
  //     localizacao_origem: localOrigem,
  //     localizacao_destino: localDestino,
  //   });

  //   // Usar transação para garantir consistência
  //   return await this.entityManager.transaction(
  //     async (transactionalEntityManager) => {
  //       // Salva a movimentação primeiro
  //       const movimentacaoSalva =
  //         await transactionalEntityManager.save(movimentacao);

  //       // Processa cada item da movimentação
  //       for (const itemDto of CreateMovimentacaoDto.itens) {
  //         // Validação do item
  //         if (itemDto.quantidade <= 0) {
  //           throw new BadRequestException(
  //             'A quantidade do item deve ser maior que zero',
  //           );
  //         }

  //         // Busca o produto
  //         const produto = await transactionalEntityManager.findOne(Produto, {
  //           where: { produto_id: itemDto.produto_id },
  //         });

  //         if (!produto) {
  //           throw new NotFoundException(
  //             `Produto com ID ${itemDto.produto_id} não encontrado`,
  //           );
  //         }

  //         // Cria o item de movimentação
  //         const itemMovimentacao = this.itemMovimentacaoRepository.create({
  //           movimentacao: movimentacaoSalva,
  //           produto,
  //           quantidade: itemDto.quantidade,
  //         });

  //         await transactionalEntityManager.save(
  //           ItemMovimentacao,
  //           itemMovimentacao,
  //         );

  //         // Atualiza os estoques conforme o tipo de movimentação
  //         await this.atualizarEstoques(
  //           movimentacaoSalva.tipo,
  //           produto,
  //           itemDto.quantidade,
  //           localOrigem,
  //           localDestino,
  //           transactionalEntityManager,
  //         );
  //       }

  //       return movimentacaoSalva;
  //     },
  //   );
  // }

  // private async atualizarEstoques(
  //   tipo: TipoMovimentacao,
  //   produto: Produto,
  //   quantidade: number,
  //   localOrigem: Localizacao | null,
  //   localDestino: Localizacao | null,
  //   entityManager: EntityManager,
  // ): Promise<void> {
  //   switch (tipo) {
  //     case TipoMovimentacao.ENTRADA:
  //       // Atualiza apenas o estoque de destino
  //       await this.atualizarEstoque(
  //         produto,
  //         localDestino!,
  //         quantidade,
  //         'increment',
  //         entityManager,
  //       );
  //       break;

  //     case TipoMovimentacao.SAIDA:
  //       // Atualiza apenas o estoque de origem
  //       await this.atualizarEstoque(
  //         produto,
  //         localOrigem!,
  //         quantidade,
  //         'decrement',
  //         entityManager,
  //       );
  //       break;

  //     case TipoMovimentacao.TRANSFERENCIA:
  //       // Atualiza ambos os estoques
  //       await Promise.all([
  //         this.atualizarEstoque(
  //           produto,
  //           localOrigem!,
  //           quantidade,
  //           'decrement',
  //           entityManager,
  //         ),
  //         this.atualizarEstoque(
  //           produto,
  //           localDestino!,
  //           quantidade,
  //           'increment',
  //           entityManager,
  //         ),
  //       ]);
  //       break;
  //   }
  // }

  // private async atualizarEstoque(
  //   produto: Produto,
  //   localizacao: Localizacao,
  //   quantidade: number,
  //   operacao: 'increment' | 'decrement',
  //   entityManager: EntityManager,
  // ): Promise<void> {
  //   // Busca o registro de estoque
  //   let estoque = await entityManager.findOne(ProdutoEstoque, {
  //     where: {
  //       produto: { produto_id: produto.produto_id },
  //       localizacao: { localizacao_id: localizacao.localizacao_id },
  //     },
  //   });

  //   // Se não existe, cria um novo registro para incremento
  //   if (!estoque) {
  //     if (operacao === 'decrement') {
  //       throw new BadRequestException(
  //         `Não há estoque do produto ${produto.nome} na localização ${localizacao.nome}`,
  //       );
  //     }

  //     estoque = entityManager.create(ProdutoEstoque, {
  //       produto,
  //       localizacao,
  //       quantidade: 0,
  //     });
  //   }

  //   // Valida estoque suficiente para saída/transferência
  //   if (operacao === 'decrement' && estoque.quantidade < quantidade) {
  //     throw new BadRequestException(
  //       `Quantidade insuficiente do produto ${produto.nome} na localização ${localizacao.nome}`,
  //     );
  //   }

  //   // Atualiza a quantidade
  //   estoque.quantidade =
  //     operacao === 'increment'
  //       ? estoque.quantidade + quantidade
  //       : estoque.quantidade - quantidade;

  //   await entityManager.save(ProdutoEstoque, estoque);
  // }
  // create(createMovimentacaoDto: CreateMovimentacaoDto) {
  //   return 'This action adds a new movimentacao';
  // }
  // findAll() {
  //   return `This action returns all movimentacao`;
  // }
  // findOne(id: number) {
  //   return `This action returns a #${id} movimentacao`;
  // }
  // update(id: number, updateMovimentacaoDto: UpdateMovimentacaoDto) {
  //   return `This action updates a #${id} movimentacao`;
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} movimentacao`;
  // }
}
