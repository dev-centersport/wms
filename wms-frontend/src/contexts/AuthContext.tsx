import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { buscarPerfilUsuario, logoutBackend, removerToken } from '../services/authService';

interface User {
  usuario_id: number;
  usuario: string;
  nivel: number;
  perfil: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (usuario: string, senha: string) => Promise<{ status: number; message: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Verifica se há um token válido ao inicializar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Tenta buscar o perfil do usuário para verificar se o token é válido
        const userData = await buscarPerfilUsuario();
        setUser({
          usuario_id: userData.usuario_id,
          usuario: userData.usuario,
          nivel: userData.nivel || 1,
          perfil: userData.perfil,
        });
      } catch (error: any) {
        // Se der erro 401, limpa o token e redireciona
        if (error.response?.status === 401) {
          console.log('🔄 Token inválido, fazendo logout automático');
          await removerToken();
          setUser(null);
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (usuario: string, senha: string) => {
    try {
      // Limpar token anterior antes de fazer novo login
      await removerToken();
      
      const response = await fetch('http://151.243.0.78:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario, senha }),
      });

      const data = await response.json();
      
      if (response.ok && data.access_token) {
        // Salvar token usando o serviço
        const { salvarToken } = await import('../services/authService');
        await salvarToken(data.access_token);
        
        setUser({
          usuario_id: data.usuario_id,
          usuario: data.usuario,
          nivel: data.nivel,
          perfil: data.perfil,
        });
        
        return { status: 200, message: 'Login realizado com sucesso!' };
      } else {
        return { status: 401, message: data.message || 'Usuário ou senha inválidos' };
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        return { status: error.response.status, message: error.response.data.message };
      }
      return { status: 500, message: 'Erro inesperado ao tentar login.' };
    }
  };

  const logout = async () => {
    try {
      // Chama o endpoint de logout no backend para limpar o token no banco
      await logoutBackend();
    } catch (error) {
      console.log('❌ Erro ao fazer logout no backend:', error);
    } finally {
      // Sempre limpa o token local e o estado do usuário
      await removerToken();
      setUser(null);
      window.location.href = '/login';
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 