import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import api from '../services/API';

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
      const token = Cookies.get('token');
      
      if (token) {
        try {
          // Tenta buscar o perfil do usuário para verificar se o token é válido
          const response = await api.get('/auth/profile');
          setUser({
            usuario_id: response.data.usuario_id,
            usuario: response.data.usuario,
            nivel: response.data.nivel || 1,
            perfil: response.data.perfil,
          });
        } catch (error) {
          // Se der erro 401, limpa o token e redireciona
          console.log('Token inválido, fazendo logout automático');
          Cookies.remove('token');
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (usuario: string, senha: string) => {
    try {
      const response = await api.post('/auth/login', { usuario, senha });
      
      if (response.data.access_token) {
        Cookies.set('token', response.data.access_token, { expires: 1 });
        
        setUser({
          usuario_id: response.data.usuario_id,
          usuario: response.data.usuario,
          nivel: response.data.nivel,
          perfil: response.data.perfil,
        });
        
        return { status: 200, message: 'Login realizado com sucesso!' };
      } else {
        return { status: 401, message: 'Usuário ou senha inválidos' };
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
      await api.post('/auth/logout');
    } catch (error) {
      console.log('Erro ao fazer logout no backend:', error);
    } finally {
      // Sempre limpa o token local e o estado do usuário
      Cookies.remove('token');
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