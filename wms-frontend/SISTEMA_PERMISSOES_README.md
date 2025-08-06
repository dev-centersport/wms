# Sistema de Permissões - WMS Frontend

## Visão Geral

O sistema de permissões foi implementado para controlar o acesso dos usuários às diferentes funcionalidades do sistema baseado em seus perfis. Cada usuário possui um perfil que define suas permissões através de 4 flags principais:

- `pode_ver`: Permite visualizar/consultar dados
- `pode_add`: Permite criar novos registros
- `pode_edit`: Permite editar registros existentes
- `pode_delete`: Permite excluir registros

## Como Funciona

### 1. Backend (JWT Token)

O backend inclui as informações de permissão do usuário no token JWT durante o login:

```typescript
// auth.service.ts
login(user: Usuario) {
  const payload = {
    sub: user.usuario_id,
    usuario: user.usuario,
    responsavel: user.responsavel,
    perfil: user.perfil.nome,
    perfil_id: user.perfil.perfil_id,
    pode_ver: user.perfil.pode_ver,
    pode_add: user.perfil.pode_add,
    pode_edit: user.perfil.pode_edit,
    pode_delete: user.perfil.pode_delete,
  };
  return {
    access_token: this.jwtService.sign(payload),
  };
}
```

### 2. Frontend - Contexto de Autenticação

O `AuthContext` gerencia o estado do usuário logado e suas permissões:

```typescript
// contexts/AuthContext.tsx
interface User {
  usuario: string;
  responsavel: string;
  perfil: string;
  perfil_id: number;
  pode_ver: boolean;
  pode_add: boolean;
  pode_edit: boolean;
  pode_delete: boolean;
  usuario_id: number;
}
```

### 3. Hook de Permissões

O `usePermissions` hook mapeia as permissões básicas para permissões específicas de cada funcionalidade:

```typescript
// hooks/usePermissions.tsx
const userPermissions: Permissions = {
  // Armazém
  canViewArmazem: user.pode_ver,
  canAddArmazem: user.pode_add,
  canEditArmazem: user.pode_edit,
  canDeleteArmazem: user.pode_delete,
  
  // Localização
  canViewLocalizacao: user.pode_ver,
  canAddLocalizacao: user.pode_add,
  canEditLocalizacao: user.pode_edit,
  canDeleteLocalizacao: user.pode_delete,
  
  // ... outras permissões
};
```

## Componentes de Proteção

### 1. PermissionRoute

Protege rotas inteiras baseado em permissões:

```typescript
<Route path="armazem" element={
  <PermissionRoute requiredPermission="canViewArmazem">
    <Armazem />
  </PermissionRoute>
} />
```

### 2. PermissionGuard

Mostra/esconde elementos específicos baseado em permissões:

```typescript
<PermissionGuard permission="canAddArmazem">
  <Button variant="contained" onClick={handleAdd}>
    Adicionar Armazém
  </Button>
</PermissionGuard>
```

### 3. Sidebar com Filtros

O Sidebar filtra automaticamente os itens do menu baseado nas permissões do usuário:

```typescript
// Filtra os itens do menu baseado nas permissões
const filteredMenuItems = loading ? [] : menuItems.filter(item => item.permission);
```

## Hooks Disponíveis

### useAuth()
Retorna informações do usuário logado:

```typescript
const { user, loading, logout, refreshUser } = useAuth();
```

### usePermissions()
Retorna todas as permissões do usuário:

```typescript
const { permissions, loading } = usePermissions();
```

### usePermissionCheck()
Fornece métodos para verificar permissões:

```typescript
const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissionCheck();

// Verificar uma permissão específica
if (hasPermission('canAddArmazem')) {
  // Mostrar botão de adicionar
}

// Verificar se tem pelo menos uma das permissões
if (hasAnyPermission(['canAddArmazem', 'canEditArmazem'])) {
  // Mostrar ações de armazém
}

// Verificar se tem todas as permissões
if (hasAllPermissions(['canViewArmazem', 'canAddArmazem'])) {
  // Mostrar funcionalidade completa
}
```

## Exemplo de Uso

### 1. Proteger uma Página

```typescript
// index.tsx
<Route path="armazem" element={
  <PermissionRoute requiredPermission="canViewArmazem">
    <Armazem />
  </PermissionRoute>
} />
```

### 2. Mostrar/Esconder Botões

```typescript
// Armazem.tsx
import { usePermissionCheck } from '../hooks/usePermissionCheck';

const Armazem = () => {
  const { hasPermission } = usePermissionCheck();

  return (
    <div>
      <h1>Armazéns</h1>
      
      {hasPermission('canAddArmazem') && (
        <Button variant="contained" onClick={handleAdd}>
          Adicionar Armazém
        </Button>
      )}
      
      {hasPermission('canEditArmazem') && (
        <Button variant="outlined" onClick={handleEdit}>
          Editar
        </Button>
      )}
      
      {hasPermission('canDeleteArmazem') && (
        <Button variant="outlined" color="error" onClick={handleDelete}>
          Excluir
        </Button>
      )}
    </div>
  );
};
```

### 3. Usar PermissionGuard

```typescript
import PermissionGuard from '../components/PermissionGuard';

<PermissionGuard permission="canAddArmazem">
  <Button variant="contained">Adicionar</Button>
</PermissionGuard>

<PermissionGuard 
  permission="canDeleteArmazem" 
  fallback={<Typography>Sem permissão para excluir</Typography>}
>
  <Button variant="contained" color="error">Excluir</Button>
</PermissionGuard>
```

## Atualização de Perfil

Para atualizar o perfil de um usuário, use o endpoint PATCH `/usuario/:id`:

```typescript
// API.tsx
export const atualizarUsuario = async (id: number, dados: {
  perfil_id: number;
  // outros campos...
}) => {
  try {
    const response = await api.patch(`/usuario/${id}`, dados);
    return response.data;
  } catch (error) {
    throw new Error('Falha ao atualizar usuário.');
  }
};
```

## Permissões Disponíveis

### Armazém
- `canViewArmazem`
- `canAddArmazem`
- `canEditArmazem`
- `canDeleteArmazem`

### Localização
- `canViewLocalizacao`
- `canAddLocalizacao`
- `canEditLocalizacao`
- `canDeleteLocalizacao`

### Produto
- `canViewProduto`
- `canAddProduto`
- `canEditProduto`
- `canDeleteProduto`

### Movimentação
- `canViewMovimentacao`
- `canAddMovimentacao`
- `canEditMovimentacao`
- `canDeleteMovimentacao`

### Separação
- `canViewSeparacao`
- `canAddSeparacao`
- `canEditSeparacao`
- `canDeleteSeparacao`

### Ocorrência
- `canViewOcorrencia`
- `canAddOcorrencia`
- `canEditOcorrencia`
- `canDeleteOcorrencia`

### Auditoria
- `canViewAuditoria`
- `canAddAuditoria`
- `canEditAuditoria`
- `canDeleteAuditoria`

### Usuário
- `canViewUsuario`
- `canAddUsuario`
- `canEditUsuario`
- `canDeleteUsuario`

### Perfil
- `canViewPerfil`
- `canAddPerfil`
- `canEditPerfil`
- `canDeletePerfil`

### Outros
- `canViewRelatorio`
- `canViewConsulta`
- `canViewDashboard`
- `canViewArmazem3D`
- `canViewTipoLocalizacao`
- `canAddTipoLocalizacao`
- `canEditTipoLocalizacao`
- `canDeleteTipoLocalizacao`

## Fluxo de Autenticação

1. Usuário faz login
2. Backend retorna JWT com permissões
3. Frontend armazena token e informações do usuário
4. Sidebar filtra itens baseado nas permissões
5. Rotas são protegidas por PermissionRoute
6. Componentes usam PermissionGuard para elementos específicos

## Segurança

- As permissões são validadas tanto no frontend quanto no backend
- O token JWT contém as permissões para evitar requisições desnecessárias
- Rotas protegidas redirecionam para dashboard se sem permissão
- Elementos sem permissão são ocultados automaticamente 