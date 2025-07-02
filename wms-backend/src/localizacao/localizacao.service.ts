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
    const tipo = await this.tipoLocalizacaoRepository.findOneBy({
      tipo_localizacao_id: createLocalizacaoDto.tipo_localizacao_id,
    });
    if (!tipo) {
      throw new NotFoundException('Tipo de localização não encontrado');
    }

    // Verifica se o armazém existe
    const armazem = await this.armazemRepository.findOneBy({
      armazem_id: createLocalizacaoDto.armazem_id,
    });
    if (!armazem) {
      throw new NotFoundException('Armazém não encontrado');
    }

    // No seu LocalizacaoService
    const ean = String(
      createLocalizacaoDto.ean || EAN13Generator.generateRandomEAN13(),
    );

    // Validação extra
    if (!/^\d{13}$/.test(ean)) {
      throw new Error(
        `ean13 inválido: deve conter exatamente 13 dígitos. Recebido: ${ean}`,
      );
    }

    // // Teste com os 12 dígitos que você recebeu
    // const partial = '532077659963';
    // const checkDigit = EAN13Generator.calculateCheckDigit(partial);
    // console.log('EAN completo deveria ser:', partial + checkDigit);

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
