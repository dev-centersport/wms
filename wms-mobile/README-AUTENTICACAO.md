# Sistema de Autenticação - WMS Mobile

## Visão Geral

O sistema de autenticação do WMS Mobile implementa um mecanismo automático de logout e redirecionamento para a tela de login quando ocorrem erros 401 (token expirado ou inválido).

## Como Funciona

### 1. Interceptor da API (`src/api/config.js`)

O interceptor de resposta da API monitora todas as requisições e quando detecta um erro 401:

- Remove o token do AsyncStorage
- Chama o callback de logout configurado
- Registra logs para debug

### 2. Contexto de Autenticação (`src/contexts/AuthContext.js`)

O AuthContext configura um callback que será executado quando ocorrer erro 401:

- Define o callback no `useEffect` inicial
- Limpa o callback quando o componente é desmontado
- Atualiza o estado do usuário para `null`, forçando o redirecionamento

### 3. Navegação Automática (`App.js`)

O App.js usa o estado `isAuthenticated` do contexto para determinar qual tela mostrar:

- Se `isAuthenticated` for `false` → mostra a tela de Login
- Se `isAuthenticated` for `true` → mostra as telas autenticadas

## Fluxo de Funcionamento

1. **Usuário faz login** → Token é salvo no AsyncStorage
2. **Token expira** → Próxima requisição retorna erro 401
3. **Interceptor detecta erro 401** → Remove token e chama callback
4. **Callback executa** → Define `user` como `null`
5. **App.js detecta mudança** → Redireciona automaticamente para Login

## Vantagens da Implementação

- ✅ **Automático**: Não requer intervenção manual
- ✅ **Seguro**: Remove token inválido imediatamente
- ✅ **Transparente**: Usuário é redirecionado sem perceber
- ✅ **Consistente**: Funciona em todas as telas da aplicação
- ✅ **Debugável**: Logs detalhados para troubleshooting

## Logs de Debug

O sistema registra logs importantes:

```
🔒 Token removido - usuário deslogado
🔄 Redirecionando para tela de login...
🔄 Logout automático devido a erro 401
```

## Configuração

Não é necessário configurar nada adicional. O sistema funciona automaticamente após a implementação.

## Teste

Para testar o sistema:

1. Faça login na aplicação
2. Aguarde o token expirar (ou force um erro 401)
3. Tente fazer qualquer operação que requeira autenticação
4. Observe o redirecionamento automático para a tela de login
