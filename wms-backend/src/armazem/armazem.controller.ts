// Importa os decoradores e classes necessários do NestJS
import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
// Importa o serviço do módulo Armazem
import { ArmazemService } from './armazem.service';
// Importa o DTO (Data Transfer Object) para criação de armazém
import { CreateArmazemDto } from './dto/create-armazem.dto';
// Importa o DTO para atualização de armazém
import { UpdateArmazemDto } from './dto/update-armazem.dto';

// Define que esta classe é um Controller com o prefixo de rota 'armazem'
// Todas as rotas deste controller serão acessíveis em /armazem
@Controller('armazem')
export class ArmazemController {
  // Injeção de dependência do ArmazemService
  constructor(private readonly armazemService: ArmazemService) {}

  // Define um endpoint POST para criar um novo armazém
  @Post()
  // @Body() extrai os dados do corpo da requisição e valida com CreateArmazemDto
  create(@Body() createArmazemDto: CreateArmazemDto) {
    return this.armazemService.create(createArmazemDto);
  }

  // Define um endpoint GET para listar todos os armazéns
  @Get()
  findAll() {
    return this.armazemService.findAll();
  }

  // Define um endpoint GET com parâmetro :id para buscar um armazém específico
  @Get(':id')
  // @Param('id') extrai o parâmetro 'id' da URL
  findOne(@Param('id') id: string) {
    // O + converte string para number (TypeScript)
    return this.armazemService.findOne(+id);
  }

  // Define um endpoint PATCH para atualizar parcialmente um armazém
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateArmazemDto: UpdateArmazemDto) {
    return this.armazemService.update(+id, updateArmazemDto);
  }

  // Endpoint DELETE comentado - pode ser implementado quando necessário
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.armazemService.remove(+id);
  // }
}
