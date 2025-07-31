# Sistema de Perfis de Usuário - WMS

## 📋 Visão Geral

O sistema de perfis de usuário permite controlar granularmente as permissões de acesso dos usuários aos diferentes módulos do WMS. Cada perfil define quais módulos o usuário pode visualizar, criar, editar ou excluir.

## 🚀 Funcionalidades

### ✨ Interface Moderna e Intuitiva
- **Design Responsivo**: Interface adaptável para diferentes tamanhos de tela
- **Cards Visuais**: Exibição clara dos perfis com status coloridos
- **Animações Suaves**: Transições e efeitos hover para melhor UX
- **Ícones Descritivos**: Cada módulo possui ícone único para fácil identificação

### 🔐 Controle Granular de Permissões
- **Visualizar**: Permite ver o conteúdo do módulo
- **Criar**: Permite adicionar novos registros
- **Editar**: Permite modificar registros existentes
- **Excluir**: Permite remover registros

### 📊 Estatísticas em Tempo Real
- Contador de perfis por tipo de permissão
- Visão geral das permissões ativas
- Indicadores visuais de status

### ⚡ Ações Rápidas
- Marcar/desmarcar todas as permissões de uma vez
- Botões de ação rápida para cada tipo de permissão
- Confirmações para ações destrutivas

## 🛠️ Como Usar

### 1. Acessando a Página
- Navegue até o menu lateral
- Clique em "Perfis" (ícone de cadeado)
- A página `/perfil-usuario` será carregada

### 2. Criando um Novo Perfil
1. Clique no botão "Novo Perfil" (canto superior direito)
2. Preencha as informações básicas:
   - **Nome do Perfil**: Identificador único (ex: "Separador", "Auditor")
   - **Descrição**: Explicação do propósito do perfil
3. Configure as permissões por módulo
4. Clique em "Criar Perfil"

### 3. Editando um Perfil Existente
1. Clique no ícone de edição (lápis) no card do perfil
2. Modifique as informações desejadas
3. Ajuste as permissões conforme necessário
4. Clique em "Atualizar Perfil"

### 4. Excluindo um Perfil
1. Clique no ícone de exclusão (lixeira) no card do perfil
2. Confirme a ação na caixa de diálogo
3. O perfil será removido permanentemente

### 5. Configurando Permissões

#### Método Individual
- Use os checkboxes em cada módulo para definir permissões específicas
- As permissões são hierárquicas: "Criar", "Editar" e "Excluir" dependem de "Visualizar"

#### Método em Lote
- Use os botões de ação rápida no topo da seção de permissões:
  - **Visualizar**: Marca/desmarca visualização para todos os módulos
  - **Criar**: Marca/desmarca criação para todos os módulos
  - **Editar**: Marca/desmarca edição para todos os módulos
  - **Excluir**: Marca/desmarca exclusão para todos os módulos

## 📱 Módulos Disponíveis

| Módulo | Ícone | Descrição |
|--------|-------|-----------|
| Dashboard | 📊 | Página inicial e estatísticas |
| Armazém | 🏢 | Gerenciamento de armazéns |
| Tipo Localização | 📍 | Tipos de localização |
| Localização | 🗺️ | Localizações físicas |
| Produto | 📦 | Cadastro de produtos |
| Consulta | 🔍 | Consultas e relatórios |
| Movimentação | 🔄 | Movimentação de estoque |
| Transferência | 📤 | Transferências entre localizações |
| Separação | 📋 | Processo de separação |
| Ocorrência | ⚠️ | Gestão de ocorrências |
| Auditoria | ✅ | Processos de auditoria |
| Relatórios | 📈 | Relatórios gerenciais |
| Usuários | 👥 | Gestão de usuários |
| Perfis | 🔐 | Gestão de perfis (meta-permissão) |

## 🎨 Status dos Perfis

### Cores dos Chips
- **🟢 Verde (Completo)**: Todas as permissões ativas
- **🟡 Amarelo (Edição)**: Apenas visualização e edição
- **🔵 Azul (Visualização)**: Apenas visualização

### Indicadores Visuais
- **CheckCircle**: Perfil com permissões completas
- **Warning**: Perfil com permissões limitadas
- **Bordas Coloridas**: Cards destacam perfis com permissões completas

## 🔧 Integração com Backend

### Endpoints Utilizados
- `GET /perfil` - Listar todos os perfis
- `POST /perfil` - Criar novo perfil
- `PATCH /perfil/:id` - Atualizar perfil existente
- `DELETE /perfil/:id` - Excluir perfil

### Estrutura de Dados
```typescript
interface Perfil {
  perfil_id: number;
  nome: string;
  descricao?: string;
  pode_ver: boolean;
  pode_add: boolean;
  pode_edit: boolean;
  pode_delete: boolean;
}
```

## 🚨 Considerações de Segurança

### Validações
- Nome do perfil é obrigatório
- Permissões hierárquicas (criar/editar/excluir dependem de visualizar)
- Confirmação para exclusão de perfis

### Boas Práticas
- Sempre teste as permissões antes de aplicar
- Use descrições claras para facilitar manutenção
- Evite criar perfis com permissões excessivas
- Revise periodicamente os perfis existentes

## 🎯 Próximos Passos

### Funcionalidades Futuras
- [ ] Templates de perfil pré-definidos
- [ ] Histórico de alterações de permissões
- [ ] Importação/exportação de perfis
- [ ] Validação de conflitos de permissão
- [ ] Notificações de alterações de perfil

### Melhorias Técnicas
- [ ] Cache de permissões no frontend
- [ ] Validação em tempo real
- [ ] Backup automático de configurações
- [ ] Logs detalhados de alterações

## 📞 Suporte

Para dúvidas ou problemas com o sistema de perfis:
1. Verifique se o backend está funcionando
2. Confirme se as permissões estão sendo salvas corretamente
3. Teste com diferentes tipos de perfil
4. Consulte os logs do console para erros

---

**Desenvolvido com ❤️ para o WMS** 