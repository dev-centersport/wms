import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

interface Permissions {
  canViewArmazem: boolean;
  canAddArmazem: boolean;
  canEditArmazem: boolean;
  canDeleteArmazem: boolean;
  canViewLocalizacao: boolean;
  canAddLocalizacao: boolean;
  canEditLocalizacao: boolean;
  canDeleteLocalizacao: boolean;
  canViewProduto: boolean;
  canAddProduto: boolean;
  canEditProduto: boolean;
  canDeleteProduto: boolean;
  canViewMovimentacao: boolean;
  canAddMovimentacao: boolean;
  canEditMovimentacao: boolean;
  canDeleteMovimentacao: boolean;
  canViewSeparacao: boolean;
  canAddSeparacao: boolean;
  canEditSeparacao: boolean;
  canDeleteSeparacao: boolean;
  canViewOcorrencia: boolean;
  canAddOcorrencia: boolean;
  canEditOcorrencia: boolean;
  canDeleteOcorrencia: boolean;
  canViewAuditoria: boolean;
  canAddAuditoria: boolean;
  canEditAuditoria: boolean;
  canDeleteAuditoria: boolean;
  canViewUsuario: boolean;
  canAddUsuario: boolean;
  canEditUsuario: boolean;
  canDeleteUsuario: boolean;
  canViewPerfil: boolean;
  canAddPerfil: boolean;
  canEditPerfil: boolean;
  canDeletePerfil: boolean;
  canViewRelatorio: boolean;
  canViewConsulta: boolean;
  canViewDashboard: boolean;
  canViewArmazem3D: boolean;
  canViewTipoLocalizacao: boolean;
  canAddTipoLocalizacao: boolean;
  canEditTipoLocalizacao: boolean;
  canDeleteTipoLocalizacao: boolean;
}

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPermissions(null);
      setLoading(false);
      return;
    }

    // Define permissões baseadas no perfil do usuário usando as informações do token
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
      
      // Produto
      canViewProduto: user.pode_ver,
      canAddProduto: user.pode_add,
      canEditProduto: user.pode_edit,
      canDeleteProduto: user.pode_delete,
      
      // Movimentação
      canViewMovimentacao: user.pode_ver,
      canAddMovimentacao: user.pode_add,
      canEditMovimentacao: user.pode_edit,
      canDeleteMovimentacao: user.pode_delete,
      
      // Separação
      canViewSeparacao: user.pode_ver,
      canAddSeparacao: user.pode_add,
      canEditSeparacao: user.pode_edit,
      canDeleteSeparacao: user.pode_delete,
      
      // Ocorrência
      canViewOcorrencia: user.pode_ver,
      canAddOcorrencia: user.pode_add,
      canEditOcorrencia: user.pode_edit,
      canDeleteOcorrencia: user.pode_delete,
      
      // Auditoria
      canViewAuditoria: user.pode_ver,
      canAddAuditoria: user.pode_add,
      canEditAuditoria: user.pode_edit,
      canDeleteAuditoria: user.pode_delete,
      
      // Usuário
      canViewUsuario: user.pode_ver,
      canAddUsuario: user.pode_add,
      canEditUsuario: user.pode_edit,
      canDeleteUsuario: user.pode_delete,
      
      // Perfil
      canViewPerfil: user.pode_ver,
      canAddPerfil: user.pode_add,
      canEditPerfil: user.pode_edit,
      canDeletePerfil: user.pode_delete,
      
      // Outros
      canViewRelatorio: user.pode_ver,
      canViewConsulta: user.pode_ver,
      canViewDashboard: user.pode_ver,
      canViewArmazem3D: user.pode_ver,
      canViewTipoLocalizacao: user.pode_ver,
      canAddTipoLocalizacao: user.pode_add,
      canEditTipoLocalizacao: user.pode_edit,
      canDeleteTipoLocalizacao: user.pode_delete,
    };

    setPermissions(userPermissions);
    setLoading(false);
  }, [user]);

  return { permissions, loading };
}; 