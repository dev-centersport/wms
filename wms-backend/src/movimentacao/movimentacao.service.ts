import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Movimentacao, TipoMovimentacao } from './entities/movimentacao.entity';
import { Repository } from 'typeorm';
import { Localizacao } from 'src/localizacao/entities/localizacao.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { ProdutoEstoque } from 'src/produto_estoque/entities/produto_estoque.entity';

@Injectable()
export class MovimentacaoService {
  constructor(
    @InjectRepository(Movimentacao)
    private readonly movimentacaoRepository: Repository<Movimentacao>,
    @InjectRepository(Localizacao)
    private readonly localizacaoRepository: Repository<Localizacao>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(ProdutoEstoque)
    private readonly produtoEstoqueRepository: Repository<ProdutoEstoque>,
  ) {}

  async create(
    CreateMovimentacaoDto: CreateMovimentacaoDto,
  ): Promise<Movimentacao> {
    if (CreateMovimentacaoDto.quantidade <= 0)
      throw new BadRequestException('A quantidade deve ser maior que zero');

    // Busca o usuário
    const usuario = await this.usuarioRepository.findOne({
      where: { usuario_id: CreateMovimentacaoDto.usuario_id },
    });

    if (!usuario)
      throw new NotFoundException(
        `Usuário com o ID ${CreateMovimentacaoDto.usuario_id} não encontrado`,
      );

    // Validação do tipo de movimentação
    switch (CreateMovimentacaoDto.tipo) {
      case TipoMovimentacao.ENTRADA:
        if (CreateMovimentacaoDto.localizacao_origem_id !== 0)
          throw new BadRequestException(
            'Para entrada, a localização de origem deve ser 0',
          );
        if (CreateMovimentacaoDto.localizacao_destino_id === 0)
          throw new BadRequestException(
            'Para entrada, a localização de destino é obrigatória',
          );

        let produtoEstoque = await this.produtoEstoqueRepository.findOne({
          where: {
            produto: {produto_id: }
          }
        })
        break;

      case TipoMovimentacao.SAIDA:
        if (CreateMovimentacaoDto.localizacao_origem_id === 0)
          throw new BadRequestException(
            'Para saída, a localização de origem é obrigatória', // Corrigido "entrada" para "saída"
          );
        if (CreateMovimentacaoDto.localizacao_destino_id !== 0)
          throw new BadRequestException(
            'Para saída, a localização de destino deve ser 0', // Corrigido "entrada" para "saída"
          );
        break;

      case TipoMovimentacao.TRANSFERENCIA:
        if (
          CreateMovimentacaoDto.localizacao_origem_id === 0 ||
          CreateMovimentacaoDto.localizacao_destino_id === 0
        )
          throw new BadRequestException(
            'Para transferência, ambas localizações são obrigatórias',
          );
        if (
          CreateMovimentacaoDto.localizacao_origem_id ===
          CreateMovimentacaoDto.localizacao_destino_id
        )
          throw new BadRequestException(
            'As localizações de origem e destino não podem ser iguais',
          );
        break;

      default:
        throw new BadRequestException('Tipo de movimentação inválido');
    }

    // Busca as localizações apenas uma vez
    const [localOrigem, localDestino] = await Promise.all([
      CreateMovimentacaoDto.localizacao_origem_id !== 0
        ? this.localizacaoRepository.findOne({
            where: {
              localizacao_id: CreateMovimentacaoDto.localizacao_origem_id,
            },
          })
        : Promise.resolve(undefined),
      CreateMovimentacaoDto.localizacao_destino_id !== 0
        ? this.localizacaoRepository.findOne({
            where: {
              localizacao_id: CreateMovimentacaoDto.localizacao_destino_id,
            },
          })
        : Promise.resolve(undefined),
    ]);

    // Valida as localizações encontradas
    if (CreateMovimentacaoDto.localizacao_origem_id !== 0 && !localOrigem)
      throw new NotFoundException('Localização de origem não encontrada');

    if (CreateMovimentacaoDto.localizacao_destino_id !== 0 && !localDestino)
      throw new NotFoundException('Localização de destino não encontrada');

    // Criação da movimentação
    const movimentacao = new Movimentacao();
    Object.assign(movimentacao, CreateMovimentacaoDto);
    movimentacao.usuario = usuario;
    if (localOrigem) {
      movimentacao.localizacao_origem = localOrigem;
    }
    if (localDestino) {
      movimentacao.localizacao_destino = localDestino;
    }

    try {
      return await this.movimentacaoRepository.save(movimentacao);
    } catch (error) {
      throw new BadRequestException('Erro ao salvar a movimentação', error);
    }
  }

  async findAll(): Promise<Movimentacao[]> {
    return await this.movimentacaoRepository.find({
      relations: ['usuario', 'localizacao_origem', 'localizacao_destino'],
    });
  }

  async findOne(movimentacao_id: number): Promise<Movimentacao> {
    const movimentacao = await this.movimentacaoRepository.findOne({
      where: { movimentacao_id },
      relations: ['usuario', 'localizacao_origem', 'localizacao_destino'],
    });

    if (!movimentacao)
      throw new NotFoundException(
        `Movimentação com ID ${movimentacao_id} não encontrada`,
      );

    return movimentacao;
  }
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
