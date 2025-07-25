import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOcorrenciaDto } from './dto/create-ocorrencia.dto';
import { Ocorrencia } from './entities/ocorrencia.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProdutoEstoque } from 'src/produto_estoque/entities/produto_estoque.entity';
import { UpdateOcorrenciaDto } from './dto/update-ocorrencia.dto';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Localizacao } from 'src/localizacao/entities/localizacao.entity';

@Injectable()
export class OcorrenciaService {
  constructor(
    @InjectRepository(Ocorrencia)
    private readonly ocorrenciaRepository: Repository<Ocorrencia>,
    @InjectRepository(ProdutoEstoque)
    private readonly produtoEstoqueRepository: Repository<ProdutoEstoque>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Localizacao)
    private readonly localizacaoRepository: Repository<Localizacao>,
  ) {}

  async findAll(): Promise<Ocorrencia[]> {
    return await this.ocorrenciaRepository.find({
      relations: ['produto_estoque.produto', 'usuario', 'localizacao.armazem'],
    });
  }

  async listarPorLocalizacao(): Promise<
    {
      armazem: string | null;
      localizacao: string | null;
      quantidade: number;
      produto: {
        produto_id: number;
        descricao: string;
        ean: string;
        sku: string;
        qtd_sistema: number;
        qtd_esperada: number;
        diferenca: number;
        ativo: boolean;
      }[];
    }[]
  > {
    // Busca todas as ocorrências com as relações necessárias
    const ocorrencias = await this.ocorrenciaRepository.find({
      relations: ['produto_estoque.produto', 'localizacao.armazem'],
    });

    // Agrupa as ocorrências por localização
    const agrupamento = ocorrencias.reduce(
      (acc, ocorrencia) => {
        const primeiraLocalizacao = ocorrencia.localizacao;
        if (!primeiraLocalizacao) return acc;

        const armazemNome = primeiraLocalizacao.armazem?.nome || null;
        const localizacaoNome = primeiraLocalizacao.nome || null;

        // Encontra ou cria o grupo para esta localização
        let grupo = acc.find(
          (g) => g.localizacao === localizacaoNome && g.armazem === armazemNome,
        );

        if (!grupo) {
          grupo = {
            armazem: armazemNome,
            localizacao: localizacaoNome,
            quantidade: 0,
            produto: [],
          };
          acc.push(grupo);
        }

        // Adiciona o produto ao grupo se existir
        if (ocorrencia.produto_estoque?.produto) {
          const produto = ocorrencia.produto_estoque.produto;

          // Verifica se o produto já está na lista
          const produtoExistente = grupo.produto.find(
            (p) => p.produto_id === produto.produto_id,
          );

          if (!produtoExistente) {
            grupo.produto.push({
              produto_id: produto.produto_id,
              descricao: produto.descricao,
              ean: produto.ean || 'S/EAN',
              sku: produto.sku,
              qtd_sistema: ocorrencia.quantidade_sistemas,
              qtd_esperada: ocorrencia.quantidade_esperada,
              diferenca: ocorrencia.diferenca_quantidade,
              ativo: ocorrencia.ativo,
            });
            grupo.quantidade++;
          }
        }

        return acc;
      },
      [] as {
        armazem: string | null;
        localizacao: string | null;
        quantidade: number;
        produto: {
          produto_id: number;
          descricao: string;
          ean: string;
          sku: string;
          qtd_sistema: number;
          qtd_esperada: number;
          diferenca: number;
          ativo: boolean;
        }[];
      }[],
    );

    return agrupamento;
  }

  async findOne(ocorrencia_id: number): Promise<Ocorrencia> {
    const ocorrencia = await this.ocorrenciaRepository.findOne({
      where: { ocorrencia_id },
      relations: ['produto_estoque', 'usuario', 'localizacao'],
    });

    if (!ocorrencia)
      throw new NotFoundException(
        `Ocorrência com o ID ${ocorrencia_id} não encontrado`,
      );

    return ocorrencia;
  }

  async create(CreateOcorrenciaDto: CreateOcorrenciaDto): Promise<{
    ocorrencia_id: number;
    usuario: string;
    dataHora: Date;
    ativo: boolean;
    quantidade_esperada: number;
    quantidade_sistemas: number;
    diferenca_quantidade: number;
    produto_estoque: {
      produto_estoque_id: number;
      produto: string;
      sku: string;
      ean: string;
      quantidade: number;
      localizacao: string;
      armazem: string;
    };
  }> {
    const [produto_estoque, usuario, localizacao] = await Promise.all([
      this.produtoEstoqueRepository.findOne({
        where: { produto_estoque_id: CreateOcorrenciaDto.produto_estoque_id },
        relations: ['localizacao.armazem', 'produto'],
      }),
      this.usuarioRepository.findOne({
        where: { usuario_id: CreateOcorrenciaDto.usuario_id },
      }),
      this.localizacaoRepository.findOne({
        where: { localizacao_id: CreateOcorrenciaDto.localizacao_id },
        relations: ['produtos_estoque'],
      }),
    ]);

    // console.log(produto_estoque);

    if (!produto_estoque)
      throw new NotFoundException('Produto estoque não encontrado');
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    if (!localizacao) throw new NotFoundException('Localização não encontrado');

    // Verifica se o produto está na localização
    const produtoNaLocalizacao = localizacao.produtos_estoque.some(
      (prod) =>
        prod.produto_estoque_id === CreateOcorrenciaDto.produto_estoque_id,
    );

    if (!produtoNaLocalizacao)
      throw new BadRequestException(
        'O produto não está presente na localização especificada',
      );

    if (CreateOcorrenciaDto.quantidade_esperada === produto_estoque.quantidade)
      throw new BadRequestException(
        'A localização possui a quantidade igual a informada',
      );

    const ocorrenciaCriada = this.ocorrenciaRepository.create({
      ...CreateOcorrenciaDto,
      produto_estoque,
      usuario,
      localizacao,
    });

    const ocorrencia = await this.ocorrenciaRepository.save(ocorrenciaCriada);

    // return await this.ocorrenciaRepository.save(ocorrencia);
    return {
      ocorrencia_id: ocorrencia.ocorrencia_id,
      usuario: ocorrencia.usuario.usuario,
      dataHora: ocorrencia.dataHora,
      ativo: ocorrencia.ativo,
      quantidade_esperada: ocorrencia.quantidade_esperada,
      quantidade_sistemas: ocorrencia.quantidade_sistemas,
      diferenca_quantidade: ocorrencia.diferenca_quantidade,
      produto_estoque: {
        produto_estoque_id: ocorrencia.produto_estoque.produto_estoque_id,
        produto: ocorrencia.produto_estoque.produto.descricao,
        sku: ocorrencia.produto_estoque.produto.sku,
        ean: ocorrencia.produto_estoque.produto.ean || 'S/EAN',
        quantidade: ocorrencia.produto_estoque.quantidade,
        localizacao: ocorrencia.produto_estoque.localizacao.nome,
        armazem: ocorrencia.produto_estoque.localizacao.armazem.nome,
      },
    };
  }

  async update(
    ocorrencia_id: number,
    UpdateOcorrenciaDto: UpdateOcorrenciaDto,
  ): Promise<Ocorrencia> {
    const ocorrencia = await this.ocorrenciaRepository.findOne({
      where: { ocorrencia_id },
      relations: ['produto_estoque', 'usuario'],
    });

    if (!ocorrencia) throw new NotFoundException('Ocorrência não encontrada');

    if (UpdateOcorrenciaDto.produto_estoque_id !== undefined) {
      const produto_estoque = await this.produtoEstoqueRepository.findOneBy({
        produto_estoque_id: UpdateOcorrenciaDto.produto_estoque_id,
      });
      if (!produto_estoque)
        throw new NotFoundException('Produtos no estoque não encontrado');
    }

    if (UpdateOcorrenciaDto.localizacao_id !== undefined) {
      const localizacao = await this.localizacaoRepository.findOneBy({
        localizacao_id: UpdateOcorrenciaDto.localizacao_id,
      });
      if (!localizacao)
        throw new NotFoundException('Localização não encontrado');
    }

    const { produto_estoque_id, localizacao_id, ...camposSimples } =
      UpdateOcorrenciaDto;
    Object.assign(ocorrencia, camposSimples);

    const ocorrenciaSalva = await this.ocorrenciaRepository.save(ocorrencia);

    return ocorrenciaSalva;
  }

  async remove(ocorrencia_id: number): Promise<void> {
    const ocorrencia = await this.findOne(ocorrencia_id);

    await this.ocorrenciaRepository.remove(ocorrencia);
  }
}
