import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOcorrenciaDto } from './dto/create-ocorrencia.dto';
import { Ocorrencia } from './entities/ocorrencia.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProdutoEstoque } from 'src/produto_estoque/entities/produto_estoque.entity';
import { UpdateOcorrenciaDto } from './dto/update-ocorrencia.dto';

@Injectable()
export class OcorrenciaService {
  constructor(
    @InjectRepository(Ocorrencia)
    private readonly ocorrenciaRepository: Repository<Ocorrencia>,
    @InjectRepository(ProdutoEstoque)
    private readonly produtoEstoqueRepository: Repository<ProdutoEstoque>,
  ) {}

  async findAll(): Promise<Ocorrencia[]> {
    return await this.ocorrenciaRepository.find({
      relations: ['produtos_estoque'],
    });
  }

  async findOne(ocorrencia_id: number): Promise<Ocorrencia> {
    const ocorrencia = await this.ocorrenciaRepository.findOne({
      where: { ocorrencia_id },
      relations: ['produtos_estoque'],
    });

    if (!ocorrencia)
      throw new NotFoundException(
        `Ocorrência com o ID ${ocorrencia_id} não encontrado`,
      );

    return ocorrencia;
  }

  async create(CreateOcorrenciaDto: CreateOcorrenciaDto): Promise<Ocorrencia> {
    const produtos_estoque = await this.produtoEstoqueRepository.findOne({
      where: { produto_estoque_id: CreateOcorrenciaDto.produto_estoque_id },
    });

    if (!produtos_estoque)
      throw new NotFoundException('Produto estoque não encontrado');

    const ocorrencia = this.ocorrenciaRepository.create({
      ...CreateOcorrenciaDto,
      produtos_estoque,
    });

    return await this.ocorrenciaRepository.save(ocorrencia);
  }

  async update(
    ocorrencia_id: number,
    UpdateOcorrenciaDto: UpdateOcorrenciaDto,
  ): Promise<Ocorrencia> {
    const ocorrencia = await this.ocorrenciaRepository.findOne({
      where: { ocorrencia_id },
      relations: ['produtos_estoque'],
    });

    if (!ocorrencia) throw new NotFoundException('Ocorrência não encontrada');

    if (UpdateOcorrenciaDto.produto_estoque_id !== undefined) {
      const produtos_estoque = await this.produtoEstoqueRepository.findOneBy({
        produto_estoque_id: UpdateOcorrenciaDto.produto_estoque_id,
      });
      if (!produtos_estoque)
        throw new NotFoundException('Produtos no estoque não encontrado');
    }

    const { produto_estoque_id, ...camposSimples } = UpdateOcorrenciaDto;
    Object.assign(ocorrencia, camposSimples);

    const ocorrenciaSalva = await this.ocorrenciaRepository.save(ocorrencia);

    return ocorrenciaSalva;
  }

  async remove(ocorrencia_id: number): Promise<void> {
    const ocorrencia = await this.findOne(ocorrencia_id);

    await this.ocorrenciaRepository.remove(ocorrencia);
  }
  // create(createOcorrenciaDto: CreateOcorrenciaDto) {
  //   return 'This action adds a new ocorrencia';
  // }
  // findAll() {
  //   return `This action returns all ocorrencia`;
  // }
  // findOne(id: number) {
  //   return `This action returns a #${id} ocorrencia`;
  // }
  // update(id: number, updateOcorrenciaDto: UpdateOcorrenciaDto) {
  //   return `This action updates a #${id} ocorrencia`;
  // }
  // remove(id: number) {
  //   return `This action removes a #${id} ocorrencia`;
  // }
}
