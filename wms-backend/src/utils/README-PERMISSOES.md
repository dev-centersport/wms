# Sistema de Permissões - WMS

## Visão Geral

O sistema de permissões implementado permite controlar o acesso dos usuários aos diferentes módulos do WMS através de perfis e permissões extras individuais.

## Estrutura

### Entidades

1. **Permissao**: Define as permissões por módulo (incluir, editar, excluir)
2. **Perfil**: Agrupa permissões que podem ser atribuídas a usuários
3. **Usuario**: Possui um perfil e pode ter permissões extras individuais

### Módulos Disponíveis

- `armazem` - Gerenciamento de armazéns
- `tipo_localizacao` - Tipos de localização
- `localização` - Localizações físicas
- `movimentação` - Movimentações de estoque
- `transferência` - Transferências entre localizações
- `ocorrência` - Ocorrências/incidentes
- `auditoria` - Auditorias de estoque
- `relatório` - Relatórios
- `usuário` - Gerenciamento de usuários

## API Endpoints

### Permissões

```
GET    /permissao                    - Listar todas as permissões
GET    /permissao/:id               - Buscar permissão por ID
GET    /permissao/modulo/:modulo    - Buscar permissões por módulo
POST   /permissao                   - Criar nova permissão
PATCH  /permissao/:id               - Atualizar permissão
DELETE /permissao/:id               - Remover permissão
POST   /permissao/criar-padrao      - Criar permissões padrão para todos os módulos
```

### Perfis

```
GET    /perfil                      - Listar todos os perfis
GET    /perfil/:id                  - Buscar perfil por ID
POST   /perfil                      - Criar novo perfil
PATCH  /perfil/:id                  - Atualizar perfil
DELETE /perfil/:id                  - Remover perfil
POST   /perfil/:id/permissoes       - Adicionar permissões ao perfil
DELETE /perfil/:id/permissoes       - Remover permissões do perfil
PATCH  /perfil/:id/permissoes       - Definir permissões do perfil (substitui todas)
```

### Usuários

```
GET    /usuario                     - Listar todos os usuários
GET    /usuario/:id                 - Buscar usuário por ID
POST   /usuario                     - Criar novo usuário
PATCH  /usuario/:id                 - Atualizar usuário
DELETE /usuario/:id                 - Remover usuário
GET    /usuario/:id/permissoes      - Obter permissões efetivas do usuário
POST   /usuario/:id/permissoes-extras - Adicionar permissões extras
DELETE /usuario/:id/permissoes-extras - Remover permissões extras
GET    /usuario/:id/tem-permissao   - Verificar se usuário tem permissão específica
GET    /usuario/:id/com-permissoes  - Buscar usuário com todas as permissões carregadas
```

## Exemplos de Uso

### 1. Criar Permissões Padrão

```bash
POST /permissao/criar-padrao
```

### 2. Criar um Perfil com Permissões

```bash
# 1. Criar perfil
POST /perfil
{
  "nome": "Administrador",
  "descricao": "Perfil com acesso total ao sistema"
}

# 2. Adicionar permissões ao perfil
POST /perfil/1/permissoes
{
  "permissao_ids": [1, 2, 3, 4, 5, 6, 7, 8, 9]
}
```

### 3. Criar Usuário com Perfil

```bash
POST /usuario
{
  "responsavel": "João Silva",
  "usuario": "joao.silva",
  "senha": "123456",
  "nivel": 1,
  "cpf": "12345678901",
  "perfil_id": 1
}
```

### 4. Adicionar Permissões Extras ao Usuário

```bash
POST /usuario/1/permissoes-extras
{
  "permissao_ids": [10, 11]
}
```

### 5. Verificar Permissões do Usuário

```bash
# Obter todas as permissões efetivas
GET /usuario/1/permissoes

# Verificar permissão específica
GET /usuario/1/tem-permissao?modulo=armazem&acao=incluir
```

## Guard de Permissões

Para proteger endpoints automaticamente, use o `PermissoesGuard`:

```typescript
import { RequerPermissao } from '../auth/decorators/permissoes.decorator';
import { PermissoesGuard } from '../auth/permissoes.guard';

@Controller('armazem')
export class ArmazemController {
  @Post()
  @UseGuards(PermissoesGuard)
  @RequerPermissao('armazem', 'incluir')
  create(@Body() createArmazemDto: CreateArmazemDto) {
    return this.armazemService.create(createArmazemDto);
  }

  @Patch(':id')
  @UseGuards(PermissoesGuard)
  @RequerPermissao('armazem', 'editar')
  update(@Param('id') id: string, @Body() updateArmazemDto: UpdateArmazemDto) {
    return this.armazemService.update(+id, updateArmazemDto);
  }

  @Delete(':id')
  @UseGuards(PermissoesGuard)
  @RequerPermissao('armazem', 'excluir')
  remove(@Param('id') id: string) {
    return this.armazemService.remove(+id);
  }
}
```

## Lógica de Permissões Efetivas

As permissões efetivas de um usuário são calculadas da seguinte forma:

1. **Permissões do Perfil**: Permissões base do perfil atribuído ao usuário
2. **Permissões Extras**: Permissões individuais adicionadas diretamente ao usuário
3. **Combinação**: Se o usuário tem permissão no perfil OU nas extras, ele tem acesso

### Exemplo:

- **Perfil "Operador"**: Pode incluir e editar em "armazem"
- **Usuário João**: Tem perfil "Operador" + permissão extra para excluir em "armazem"
- **Resultado**: João pode incluir, editar E excluir em "armazem"

## Migração de Dados

Para migrar dados existentes, execute:

```bash
# 1. Criar permissões padrão
POST /permissao/criar-padrao

# 2. Criar perfis básicos
POST /perfil
{
  "nome": "Administrador",
  "descricao": "Acesso total"
}

POST /perfil
{
  "nome": "Operador",
  "descricao": "Acesso limitado"
}

# 3. Atribuir permissões aos perfis
# (usar os endpoints de permissões do perfil)
```

## Segurança

- Todos os endpoints de permissões requerem autenticação
- Use o `PermissoesGuard` para proteger endpoints sensíveis
- As permissões são verificadas em tempo de execução
- Senhas são criptografadas antes de salvar no banco
