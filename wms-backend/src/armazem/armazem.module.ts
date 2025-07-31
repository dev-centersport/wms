// Importa os decoradores e classes necessários do NestJS
import { Module } from '@nestjs/common';
// Importa o serviço do módulo Armazem
import { ArmazemService } from './armazem.service';
// Importa o controller do módulo Armazem
import { ArmazemController } from './armazem.controller';
// Importa o módulo TypeORM para integração com banco de dados
import { TypeOrmModule } from '@nestjs/typeorm';
// Importa a entidade Armazem que representa a tabela no banco de dados
import { Armazem } from './entities/armazem.entity';
import { AuthModule } from 'src/auth/auth.module';

// Define um módulo NestJS usando o decorador @Module
@Module({
  // Importa módulos necessários para este módulo
  imports: [
    // Registra a entidade Armazem no TypeORM para que possa ser injetada/referenciada
    // dentro deste módulo (cria um repositório para a entidade)
    TypeOrmModule.forFeature([Armazem]),
    AuthModule,
  ],
  // Define os controllers que pertencem a este módulo
  controllers: [ArmazemController],
  // Define os providers (serviços, repositórios, etc.) que pertencem a este módulo
  providers: [ArmazemService],
  // Por padrão, os providers são privados ao módulo. Se quisermos disponibilizá-los
  // para outros módulos, precisaríamos adicionar uma propriedade 'exports'
})
export class ArmazemModule {}
