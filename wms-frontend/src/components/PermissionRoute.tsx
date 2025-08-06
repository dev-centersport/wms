import React from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { usePermissions } from '../hooks/usePermissions';

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

interface PermissionRouteProps {
  children: React.ReactNode;
  requiredPermission: keyof Permissions;
  fallbackPath?: string;
}

const PermissionRoute: React.FC<PermissionRouteProps> = ({ 
  children, 
  requiredPermission, 
  fallbackPath = '/dashboard' 
}) => {
  const { permissions, loading } = usePermissions();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Typography>Carregando permissões...</Typography>
      </Box>
    );
  }

  if (!permissions || !permissions[requiredPermission]) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        p={3}
      >
        <Typography variant="h4" gutterBottom>
          Acesso Negado
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" mb={3}>
          Você não tem permissão para acessar esta página.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.href = fallbackPath}
        >
          Voltar ao Dashboard
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
};

export default PermissionRoute; 