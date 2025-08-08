import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/API';

interface Permissao {
  permissao_id: number;
  modulo: string;
  pode_ver: boolean;
  pode_incluir: boolean;
  pode_editar: boolean;
  pode_excluir: boolean;
}

interface PermissaoContextType {
  permissoes: Permissao[];
  loading: boolean;
  temPermissao: (modulo: string, acao: 'ver' | 'incluir' | 'editar' | 'excluir') => boolean;
  recarregarPermissoes: () => Promise<void>;
}

const PermissaoContext = createContext<PermissaoContextType | undefined>(undefined);

export const usePermissao = () => {
  const context = useContext(PermissaoContext);
  if (context === undefined) {
    throw new Error('usePermissao deve ser usado dentro de um PermissaoProvider');
  }
  return context;
};

interface PermissaoProviderProps {
  children: ReactNode;
}

export const PermissaoProvider: React.FC<PermissaoProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [loading, setLoading] = useState(false);

  const carregarPermissoes = async () => {
    if (!user || !isAuthenticated) {
      setPermissoes([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/usuario/${user.usuario_id}/permissoes`);
      setPermissoes(response.data);
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
      setPermissoes([]);
    } finally {
      setLoading(false);
    }
  };

  const recarregarPermissoes = async () => {
    await carregarPermissoes();
  };

  const temPermissao = (modulo: string, acao: 'ver' | 'incluir' | 'editar' | 'excluir'): boolean => {
    const permissao = permissoes.find(p => p.modulo === modulo);
    if (!permissao) return false;

    switch (acao) {
      case 'ver':
        return permissao.pode_ver;
      case 'incluir':
        return permissao.pode_incluir;
      case 'editar':
        return permissao.pode_editar;
      case 'excluir':
        return permissao.pode_excluir;
      default:
        return false;
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      carregarPermissoes();
    } else {
      setPermissoes([]);
    }
  }, [isAuthenticated, user]);

  const value: PermissaoContextType = {
    permissoes,
    loading,
    temPermissao,
    recarregarPermissoes,
  };

  return (
    <PermissaoContext.Provider value={value}>
      {children}
    </PermissaoContext.Provider>
  );
};
