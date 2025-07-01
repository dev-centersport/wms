// Importa os decoradores de validação do pacote class-validator
import { IsString, IsNotEmpty } from 'class-validator';

// Define o Data Transfer Object (DTO) para criação de armazéns
export class CreateArmazemDto {
  /*
   * DTOs são usados para:
   * 1. Validar dados de entrada
   * 2. Definir a estrutura dos dados
   * 3. Documentar a API
   */

  // Validação para o campo 'nome'
  @IsString({ message: 'O nome deve ser uma string' }) // Valida o tipo
  @IsNotEmpty({ message: 'O nome não pode estar vazio' }) // Valida se não está vazio
  nome: string; // Campo obrigatório do tipo string

  // Validação para o campo 'endereco'
  @IsString({ message: 'O endereço deve ser uma string' })
  @IsNotEmpty({ message: 'O endereço não pode estar vazio' })
  endereco: string; // Campo obrigatório do tipo string

  /*
   * Boas práticas observadas:
   * 1. Cada campo tem validação específica
   * 2. Campos são tipados explicitamente
   * 3. Uso de decorators para validação declarativa
   * 4. Nomes de propriedades claros e descritivos
   */
}
