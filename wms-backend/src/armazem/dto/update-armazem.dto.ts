// Importa PartialType do NestJS para criar versões parciais de DTOs
import { PartialType } from '@nestjs/mapped-types';
// Importa o DTO de criação que será estendido
import { CreateArmazemDto } from './create-armazem.dto';

// Define o DTO para atualização de armazém
export class UpdateArmazemDto extends PartialType(CreateArmazemDto) {
  /*
   * O PartialType faz com que todos os campos do CreateArmazemDto
   * se tornem opcionais, mas mantém as validações originais.
   *
   * Podemos sobrescrever campos específicos para adicionar comportamentos:
   */
  /*
   * Benefícios desta abordagem:
   * 1. Herda todos os campos do CreateArmazemDto como opcionais
   * 2. Mantém as validações originais
   * 3. Permite adicionar validações específicas para atualização
   * 4. Segue o princípio DRY (Don't Repeat Yourself)
   */
}
