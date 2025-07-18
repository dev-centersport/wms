import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOcorrenciaDto } from './dto/create-ocorrencia.dto';
import { Ocorrencia } from './entities/ocorrencia.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProdutoEstoque } from 'src/produto_estoque/entities/produto_estoque.entity';
import { UpdateOcorrenciaDto } from './dto/update-ocorrencia.dto';
import { Usuario } from 'src/usuario/entities/usuario.entity';
// import { Localizacao } from 'src/localizacao/entities/localizacao.entity';

@Injectable()
export class OcorrenciaService {
  constructor(
    @InjectRepository(Ocorrencia)
    private readonly ocorrenciaRepository: Repository<Ocorrencia>,
    @InjectRepository(ProdutoEstoque)
    private readonly produtoEstoqueRepository: Repository<ProdutoEstoque>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async findAll(): Promise<Ocorrencia[]> {
    return await this.ocorrenciaRepository.find({
      relations: [
        'produto_estoque.produto',
        'usuario',
        'produto_estoque.localizacao',
      ],
    });
  }

  async listarPorLocalizacao(): Promise<
    {
      localizacao: string | null;
      quantidade: number;
      nome_produto: string;
      sku: string;
      ativo: boolean;
      ocorrencias: Ocorrencia[];
    }[]
  > {
    const ocorrencias = await this.ocorrenciaRepository.find({
      relations: [
        'produto_estoque.produto',
        'usuario',
        'produto_estoque.localizacao',
      ],
    });

    // Agrupa as ocorrências por localização
    const agrupamento = ocorrencias.reduce(
      (acc, ocorrencia) => {
        // Verifica se a ocorrência tem localizações (considerando que é um array)
        const primeiraLocalizacao = ocorrencia.produto_estoque.localizacao;
        const localizacaoNome = primeiraLocalizacao?.nome || null;
        const nomeProduto = ocorrencia.produto_estoque.produto.descricao;
        const skuProduto = ocorrencia.produto_estoque.produto.sku;

        // Encontra ou cria o grupo para esta localização
        let grupo = acc.find((g) => g.localizacao === localizacaoNome);
        if (!grupo) {
          grupo = {
            localizacao: localizacaoNome,
            quantidade: 0,
            nome_produto: nomeProduto,
            sku: skuProduto,
            ativo: ocorrencia.ativo,
            ocorrencias: [],
          };
          acc.push(grupo);
        }

        // Adiciona a ocorrência ao grupo
        grupo.quantidade++;
        grupo.ocorrencias.push(ocorrencia);

        return acc;
      },
      [] as {
        localizacao: string | null;
        quantidade: number;
        nome_produto: string;
        sku: string;
        ativo: boolean;
        ocorrencias: Ocorrencia[];
      }[],
    );

    return agrupamento;
  }

  async findOne(ocorrencia_id: number): Promise<Ocorrencia> {
    const ocorrencia = await this.ocorrenciaRepository.findOne({
      where: { ocorrencia_id },
      relations: [
        'produto_estoque.produto',
        'usuario',
        'produto_estoque.localizacao',
      ],
    });

    if (!ocorrencia)
      throw new NotFoundException(
        `Ocorrência com o ID ${ocorrencia_id} não encontrado`,
      );

    return ocorrencia;
  }

  async create(CreateOcorrenciaDto: CreateOcorrenciaDto): Promise<Ocorrencia> {
    const [produto_estoque, usuario] = await Promise.all([
      this.produtoEstoqueRepository.findOne({
        where: { produto_estoque_id: CreateOcorrenciaDto.produto_estoque_id },
      }),
      this.usuarioRepository.findOne({
        where: { usuario_id: CreateOcorrenciaDto.usuario_id },
      }),
      // this.localizacaoRepository.findOne({
      //   where: { localizacao_id: CreateOcorrenciaDto.localizacao_id },
      // }),
    ]);

    if (!produto_estoque)
      throw new NotFoundException('Produto estoque não encontrado');
    if (!usuario) throw new NotFoundException('Produto estoque não encontrado');
    // if (!localizacao) throw new NotFoundException('Localização não encontrado');

    const ocorrencia = this.ocorrenciaRepository.create({
      ...CreateOcorrenciaDto,
      produto_estoque,
      usuario,
      // localizacao,
    });

    return await this.ocorrenciaRepository.save(ocorrencia);
  }

  async update(
    ocorrencia_id: number,
    UpdateOcorrenciaDto: UpdateOcorrenciaDto,
  ): Promise<Ocorrencia> {
    const ocorrencia = await this.ocorrenciaRepository.findOne({
      where: { ocorrencia_id },
      relations: [
        'produto_estoque.produto',
        'usuario',
        'produto_estoque.localizacao',
      ],
    });

    if (!ocorrencia) throw new NotFoundException('Ocorrência não encontrada');

    if (UpdateOcorrenciaDto.produto_estoque_id !== undefined) {
      const produto_estoque = await this.produtoEstoqueRepository.findOneBy({
        produto_estoque_id: UpdateOcorrenciaDto.produto_estoque_id,
      });
      if (!produto_estoque)
        throw new NotFoundException('Produtos no estoque não encontrado');
    }

    // if (UpdateOcorrenciaDto.localizacao_id !== undefined) {
    //   const localizacao = await this.localizacaoRepository.findOneBy({
    //     localizacao_id: UpdateOcorrenciaDto.localizacao_id,
    //   });
    //   if (!localizacao)
    //     throw new NotFoundException('Localização não encontrado');
    // }

    const { produto_estoque_id, ...camposSimples } = UpdateOcorrenciaDto;
    Object.assign(ocorrencia, camposSimples);

    const ocorrenciaSalva = await this.ocorrenciaRepository.save(ocorrencia);

    return ocorrenciaSalva;
  }

  async remove(ocorrencia_id: number): Promise<void> {
    const ocorrencia = await this.findOne(ocorrencia_id);

    await this.ocorrenciaRepository.remove(ocorrencia);
  }
}
