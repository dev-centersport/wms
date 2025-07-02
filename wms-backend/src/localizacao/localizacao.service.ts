import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLocalizacaoDto } from './dto/create-localizacao.dto';
import { UpdateLocalizacaoDto } from './dto/update-localizacao.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Localizacao } from './entities/localizacao.entity';
import { Repository } from 'typeorm';
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

  async findAll(): Promise<Localizacao[]> {
    return await this.LocalizacaoRepository.find({
      relations: ['tipo', 'armazem'],
    });
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

    this.LocalizacaoRepository.merge(localizacao, updateLocalizacaoDto);

    return await this.LocalizacaoRepository.save(localizacao);
  }

  async remove(localizacao_id: number): Promise<void> {
    const localizacao = await this.findOne(localizacao_id);

    await this.LocalizacaoRepository.remove(localizacao);
  }
}
