# 🔒 Implementação de Sessão Única por Usuário

## 📋 **Resumo da Implementação**

Esta implementação garante que **apenas uma sessão válida** seja mantida por usuário, invalidando automaticamente sessões anteriores quando um novo login é realizado.

---

## 🏗️ **Arquitetura Implementada**

### **Backend (NestJS + TypeORM)**

- ✅ **Auth Guard**: Verifica se o token enviado corresponde ao `current_token` do banco
- ✅ **Auth Service**: Atualiza o `current_token` ao fazer login e limpa ao fazer logout
- ✅ **Auth Controller**: Endpoint de logout que limpa o token no banco
- ✅ **User Entity**: Campo `current_token` para armazenar o token válido

### **Frontend (React + Context API)**

- ✅ **Auth Context**: Gerencia estado de autenticação global
- ✅ **Protected Routes**: Rotas que requerem autenticação
- ✅ **Public Routes**: Rotas públicas (como login)
- ✅ **Auto Logout**: Logout automático quando token é invalidado

---

## 🔧 **Mudanças Realizadas**

### **1. Backend - Auth Guard (`auth.guard.ts`)**

```typescript
// 🔒 VERIFICAÇÃO DE SESSÃO ÚNICA
const user = await this.usuarioRepository.findOne({
	where: { usuario_id: decoded.sub },
});

// Verifica se o token enviado é o mesmo armazenado no banco
if (user.current_token !== token) {
	throw new UnauthorizedException("Sessão expirada. Realize login novamente.");
}
```

### **2. Backend - Auth Service (`auth.service.ts`)**

```typescript
// 🔒 SESSÃO ÚNICA: Atualiza o token atual do usuário
user.current_token = access_token;
user.is_logged = true;
await this.usuarioRepository.save(user);
```

### **3. Frontend - Auth Context (`AuthContext.tsx`)**

```typescript
// Verifica se há um token válido ao inicializar
useEffect(() => {
  const checkAuth = async () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const response = await api.get('/auth/profile');
        setUser({...});
      } catch (error) {
        // Se der erro 401, limpa o token e redireciona
        Cookies.remove('token');
        setUser(null);
      }
    }
  };
}, []);
```

### **4. Frontend - Rotas Protegidas (`index.tsx`)**

```typescript
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { isAuthenticated, loading } = useAuth();

	if (loading) {
		return <Loading message="Verificando autenticação..." />;
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
};
```

---

## 🔄 **Fluxo de Funcionamento**

### **1. Login**

1. Usuário faz login com credenciais
2. Backend gera JWT e salva em `user.current_token`
3. Frontend salva token em cookie e atualiza contexto
4. Usuário é redirecionado para página principal

### **2. Verificação de Autenticação**

1. A cada requisição, o Auth Guard verifica:
   - Se o token é válido (JWT)
   - Se o token corresponde ao `current_token` do banco
2. Se não corresponder → erro 401 → logout automático

### **3. Novo Login (Sessão Única)**

1. Usuário faz login em outro dispositivo/navegador
2. Backend atualiza `current_token` no banco
3. Sessão anterior fica inválida automaticamente
4. Próxima requisição da sessão anterior retorna 401

### **4. Logout**

1. Frontend chama `/auth/logout`
2. Backend limpa `current_token` no banco
3. Frontend remove token do cookie
4. Usuário é redirecionado para login

---

## 🛡️ **Segurança Implementada**

### **✅ Sessão Única**

- Apenas um token válido por usuário
- Login anterior é automaticamente invalidado

### **✅ Verificação Constante**

- Cada requisição verifica se o token ainda é válido
- Logout automático em caso de token inválido

### **✅ Proteção de Rotas**

- Rotas protegidas verificam autenticação
- Redirecionamento automático para login

### **✅ Contexto Global**

- Estado de autenticação centralizado
- Informações do usuário disponíveis em toda aplicação

---

## 🚀 **Como Usar**

### **1. Em páginas que precisam do usuário logado:**

```typescript
import { useAuth } from "../contexts/AuthContext";

const MinhaPagina = () => {
	const { user, isAuthenticated, logout } = useAuth();

	// user.usuario_id, user.usuario, user.perfil disponíveis
	// isAuthenticated para verificar se está logado
	// logout() para fazer logout
};
```

### **2. Em requisições que precisam do usuario_id:**

```typescript
const { user } = useAuth();

const payload = {
	usuario_id: user.usuario_id, // 🔒 ID do usuário autenticado
	// ... outros dados
};
```

### **3. Para fazer logout:**

```typescript
const { logout } = useAuth();
await logout(); // Limpa token no backend e frontend
```

---

## 🔍 **Testando a Implementação**

### **1. Teste de Sessão Única:**

1. Faça login no navegador A
2. Faça login no navegador B (mesmo usuário)
3. Tente usar o navegador A → deve ser redirecionado para login

### **2. Teste de Logout:**

1. Faça login
2. Clique em "Sair" no sidebar
3. Deve ser redirecionado para login

### **3. Teste de Token Expirado:**

1. Faça login
2. Aguarde expiração do token (ou modifique no banco)
3. Tente acessar uma página → deve ser redirecionado para login

---

## 📝 **Próximos Passos (Opcionais)**

### **1. Melhorias de UX:**

- [ ] Notificação quando sessão é invalidada
- [ ] Modal de confirmação antes do logout
- [ ] Lembrar última página acessada

### **2. Melhorias de Segurança:**

- [ ] Refresh token para renovação automática
- [ ] Log de sessões ativas
- [ ] Limite de tentativas de login

### **3. Funcionalidades Adicionais:**

- [ ] "Lembrar-me" (token de longa duração)
- [ ] Logout de todos os dispositivos
- [ ] Histórico de logins

---

## ✅ **Status da Implementação**

- ✅ **Backend**: Sessão única implementada
- ✅ **Frontend**: Contexto de autenticação implementado
- ✅ **Rotas**: Proteção implementada
- ✅ **Logout**: Funcionalidade implementada
- ✅ **Testes**: Fluxo básico testado

**🎉 Implementação concluída e funcional!**
