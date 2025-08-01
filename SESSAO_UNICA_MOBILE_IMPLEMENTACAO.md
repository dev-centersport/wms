# 🔒 Implementação de Sessão Única por Usuário - Mobile (React Native)

## 📋 **Resumo da Implementação**

Esta implementação garante que **apenas uma sessão válida** seja mantida por usuário no aplicativo mobile, invalidando automaticamente sessões anteriores quando um novo login é realizado.

---

## 🏗️ **Arquitetura Implementada**

### **Backend (NestJS + TypeORM)**

- ✅ **Auth Guard**: Verifica se o token enviado corresponde ao `current_token` do banco
- ✅ **Auth Service**: Atualiza o `current_token` ao fazer login e limpa ao fazer logout
- ✅ **Auth Controller**: Endpoint de logout que limpa o token no banco
- ✅ **User Entity**: Campo `current_token` para armazenar o token válido

### **Mobile (React Native + AsyncStorage)**

- ✅ **Auth Context**: Gerencia estado de autenticação global
- ✅ **Protected Routes**: Rotas que requerem autenticação
- ✅ **Public Routes**: Rotas públicas (como login)
- ✅ **Auto Logout**: Logout automático quando token é invalidado

---

## 🔧 **Mudanças Realizadas**

### **1. Mobile - Auth Context (`AuthContext.js`)**

```javascript
// Verifica se há um token válido ao inicializar
useEffect(() => {
  checkAuth();
}, []);

const checkAuth = async () => {
  try {
    const token = await AsyncStorage.getItem('token');

    if (token) {
      try {
        const response = await api.get('/auth/profile');
        setUser({...});
      } catch (error) {
        // Se der erro 401, limpa o token
        await AsyncStorage.removeItem('token');
        setUser(null);
      }
    }
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
  } finally {
    setLoading(false);
  }
};
```

### **2. Mobile - Rotas Protegidas (`App.js`)**

```javascript
const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, loading } = useAuth();

	if (loading) {
		return <Loading message="Verificando autenticação..." />;
	}

	if (!isAuthenticated) {
		return <Login />;
	}

	return children;
};
```

### **3. Mobile - Tela de Login (`login.jsx`)**

```javascript
const { login } = useAuth();

const handleLogin = async () => {
	setLoading(true);
	try {
		const resultado = await login(usuario, senha);
		if (resultado.success) {
			// O redirecionamento será feito automaticamente pelo AuthContext
			console.log("Login realizado com sucesso!");
		} else {
			alert(resultado.message || "Usuário ou senha inválidos.");
		}
	} catch (err) {
		alert("Erro ao fazer login. Verifique seus dados.");
	} finally {
		setLoading(false);
	}
};
```

### **4. Mobile - Tela Home (`home.jsx`)**

```javascript
const { user, logout } = useAuth();

const handleLogout = async () => {
	Alert.alert("Sair", "Deseja realmente sair do sistema?", [
		{ text: "Cancelar", style: "cancel" },
		{
			text: "Sair",
			style: "destructive",
			onPress: async () => {
				await logout();
			},
		},
	]);
};
```

---

## 🔄 **Fluxo de Funcionamento**

### **1. Login**

1. Usuário faz login com credenciais
2. Backend gera JWT e salva em `user.current_token`
3. Mobile salva token em AsyncStorage e atualiza contexto
4. Usuário é redirecionado para tela Home

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

1. Mobile chama `/auth/logout`
2. Backend limpa `current_token` no banco
3. Mobile remove token do AsyncStorage
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

### **1. Em telas que precisam do usuário logado:**

```javascript
import { useAuth } from "../contexts/AuthContext";

const MinhaTela = () => {
	const { user, isAuthenticated, logout } = useAuth();

	// user.usuario_id, user.usuario, user.perfil disponíveis
	// isAuthenticated para verificar se está logado
	// logout() para fazer logout
};
```

### **2. Em requisições que precisam do usuario_id:**

```javascript
const { user } = useAuth();

const payload = {
	usuario_id: user.usuario_id, // 🔒 ID do usuário autenticado
	// ... outros dados
};
```

### **3. Para fazer logout:**

```javascript
const { logout } = useAuth();
await logout(); // Limpa token no backend e mobile
```

---

## 🔍 **Testando a Implementação**

### **1. Teste de Sessão Única:**

1. Faça login no mobile
2. Faça login no navegador (mesmo usuário)
3. Tente usar o mobile → deve ser redirecionado para login

### **2. Teste de Logout:**

1. Faça login no mobile
2. Clique em "Sair" na tela Home
3. Deve ser redirecionado para login

### **3. Teste de Token Expirado:**

1. Faça login no mobile
2. Aguarde expiração do token (ou modifique no banco)
3. Tente acessar uma tela → deve ser redirecionado para login

---

## 📱 **Diferenças do Mobile para o Frontend**

### **✅ AsyncStorage vs Cookies**

- Mobile usa AsyncStorage para persistir tokens
- Frontend usa Cookies para persistir tokens

### **✅ Navegação**

- Mobile usa React Navigation
- Frontend usa React Router

### **✅ Componentes**

- Mobile usa componentes nativos (View, Text, etc.)
- Frontend usa componentes web (div, span, etc.)

### **✅ Loading**

- Mobile usa ActivityIndicator
- Frontend usa CircularProgress

---

## 📝 **Próximos Passos (Opcionais)**

### **1. Melhorias de UX:**

- [ ] Notificação push quando sessão é invalidada
- [ ] Modal de confirmação antes do logout
- [ ] Lembrar última tela acessada

### **2. Melhorias de Segurança:**

- [ ] Biometria para login
- [ ] Refresh token para renovação automática
- [ ] Log de sessões ativas

### **3. Funcionalidades Adicionais:**

- [ ] "Lembrar-me" (token de longa duração)
- [ ] Logout de todos os dispositivos
- [ ] Histórico de logins

---

## ✅ **Status da Implementação**

- ✅ **Backend**: Sessão única implementada (compartilhada com frontend)
- ✅ **Mobile**: Contexto de autenticação implementado
- ✅ **Rotas**: Proteção implementada
- ✅ **Logout**: Funcionalidade implementada
- ✅ **Testes**: Fluxo básico testado

**🎉 Implementação concluída e funcional!**

---

## 🔗 **Integração com Frontend**

A implementação mobile **compartilha o mesmo backend** com o frontend, garantindo:

- ✅ **Sessão única entre dispositivos**: Login no mobile invalida sessão do navegador
- ✅ **Mesma segurança**: Mesmos endpoints e validações
- ✅ **Consistência**: Mesmo comportamento em todas as plataformas
