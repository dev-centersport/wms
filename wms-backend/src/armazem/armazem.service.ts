import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Armazem } from './entities/armazem.entity';
import { CreateArmazemDto } from './dto/create-armazem.dto';
import { UpdateArmazemDto } from './dto/update-armazem.dto';

@Injectable() // Decorator que marca a classe como um provedor injetável no NestJS
export class ArmazemService {
  constructor(
    // Injeta o repositório TypeORM para a entidade Armazem
    @InjectRepository(Armazem)
    private readonly armazemRepository: Repository<Armazem>,
  ) {}

  /**
   * Busca TODOS os armazéns no banco de dados
   * @returns Promise<Armazem[]> - Lista de armazéns
   */
  async findAll(): Promise<Armazem[]> {
    // this.armazemRepository.find() executa: SELECT * FROM armazem
    return await this.armazemRepository.find();
  }

  /**
   * Busca UM armazém pelo ID
   * @param armazem_id number - ID do armazém
   * @returns Promise<Armazem> - Dados do armazém encontrado
   * @throws NotFoundException - Se o armazém não existir
   */
  async findOne(armazem_id: number): Promise<Armazem> {
    // findOneBy busca por critérios específicos (WHERE armazem_id = ?)
    const armazem = await this.armazemRepository.findOneBy({ armazem_id });

    if (!armazem) {
      // Lança erro HTTP 404 se não encontrar
      throw new NotFoundException(
        `Armazém com ID ${armazem_id} não encontrado`,
      );
    }

    return armazem;
  }

  /**
   * Cria um NOVO armazém no banco de dados
   * @param createArmazemDto CreateArmazemDto - Dados de criação
   * @returns Promise<Armazem> - Armazém criado
   */
  async create(createArmazemDto: CreateArmazemDto): Promise<Armazem> {
    // Cria uma instância da entidade (não persiste no banco ainda)
    const armazem = this.armazemRepository.create(createArmazemDto);

    // Salva no banco: INSERT INTO armazem (...) VALUES (...)
    return await this.armazemRepository.save(armazem);
  }

  /**
   * ATUALIZA um armazém existente
   * @param armazem_id number - ID do armazém a ser atualizado
   * @param updateArmazemDto UpdateArmazemDto - Dados parciais/full para atualização
   * @returns Promise<Armazem> - Armazém atualizado
   */
  async update(
    armazem_id: number,
    updateArmazemDto: UpdateArmazemDto,
  ): Promise<Armazem> {
    // Reutiliza findOne para validar existência + tratamento de erro
    const armazem = await this.findOne(armazem_id);

    // Mescla os dados existentes com os novos dados
    this.armazemRepository.merge(armazem, updateArmazemDto);

    // Salva as alterações: UPDATE armazem SET ... WHERE armazem_id = ?
    return await this.armazemRepository.save(armazem);
  }

  /**
   * REMOVE um armazém do banco de dados
   * @param armazem_id number - ID do armazém a ser removido
   * @returns Promise<void> - Não retorna conteúdo (204 No Content)
   */
  async remove(armazem_id: number): Promise<void> {
    // Valida existência usando findOne
    const armazem = await this.findOne(armazem_id);

    // Remove: DELETE FROM armazem WHERE armazem_id = ?
    await this.armazemRepository.remove(armazem);
  }
}
