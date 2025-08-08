import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Chip,
  Avatar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

import {
  ArrowBack as ArrowBackIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useNavigate, useLocation } from 'react-router-dom';
import { buscarPerfilPorId, PerfilBackend, PermissaoBackend } from '../services/API';

export default function VisualizarPerfilUsuario() {
  const location = useLocation();
  const navigate = useNavigate();
  const perfil = location.state?.perfil as PerfilBackend;
  
  const [perfilDetalhado, setPerfilDetalhado] = useState<PerfilBackend | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  useEffect(() => {
    carregarPerfilDetalhado();
  }, []);

  const carregarPerfilDetalhado = async () => {
    if (!perfil?.perfil_id) {
      mostrarSnackbar('Perfil não encontrado', 'error');
      navigate('/perfil-usuario');
      return;
    }

    try {
      setLoading(true);
      const data = await buscarPerfilPorId(perfil.perfil_id);
      setPerfilDetalhado(data);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      mostrarSnackbar('Erro ao carregar detalhes do perfil', 'error');
      navigate('/perfil-usuario');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (permissao: PermissaoBackend) => {
    if (permissao.pode_incluir && permissao.pode_editar && permissao.pode_excluir) return 'success';
    if (permissao.pode_editar) return 'warning';
    return 'info';
  };

  const getStatusText = (permissao: PermissaoBackend) => {
    if (permissao.pode_incluir && permissao.pode_editar && permissao.pode_excluir) return 'Completo';
    if (permissao.pode_editar) return 'Edição';
    return 'Visualização';
  };

  const getModuloLabel = (modulo: string) => {
    const labels: { [key: string]: string } = {
      'armazem': 'Armazém',
      'tipo_localizacao': 'Tipo Localização',
      'localizacao': 'Localização',
      'movimentacao': 'Movimentação',
      'transferencia': 'Transferência',
      'ocorrencia': 'Ocorrência',
      'auditoria': 'Auditoria',
      'relatorio': 'Relatório',
      'usuario': 'Usuário',
    };
    return labels[modulo] || modulo;
  };

  const mostrarSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Carregando...</Typography>
        </Box>
      </Layout>
    );
  }

  if (!perfilDetalhado) {
    return (
      <Layout>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">Perfil não encontrado</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ 
        p: 3, 
        backgroundColor: '#f8f9fa',
        minHeight: '100vh'
      }}>
        {/* Header */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={4}
          sx={{
            backgroundColor: 'white',
            p: 3,
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton 
              onClick={() => navigate('/perfil-usuario')} 
              sx={{ 
                color: '#666',
                backgroundColor: '#f5f5f5',
                '&:hover': {
                  backgroundColor: '#e0e0e0'
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <SecurityIcon sx={{ color: '#4caf50', fontSize: 32 }} />
            <Box>
              <Typography variant="h4" fontWeight={600} color="#2c3e50">
                Detalhes do Perfil
              </Typography>
              <Typography variant="body2" color="#666" mt={0.5}>
                Visualize as informações e permissões do perfil
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={() => navigate('/perfil-usuario/editar', { state: { perfil: perfilDetalhado } })}
            startIcon={<EditIcon />}
            sx={{
              backgroundColor: '#2196f3',
              '&:hover': {
                backgroundColor: '#1976d2',
              },
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            Editar Perfil
          </Button>
        </Box>

        {/* Informações do Perfil */}
        <Card sx={{ mb: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={600} mb={3} color="#2c3e50">
              Informações do Perfil
            </Typography>
            
            <Box display="flex" alignItems="center" gap={3} mb={3}>
              <Avatar sx={{ 
                backgroundColor: '#4caf50',
                width: 80,
                height: 80
              }}>
                <PersonIcon sx={{ fontSize: 40 }} />
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight={600} color="#2c3e50">
                  {perfilDetalhado.nome}
                </Typography>
                <Typography variant="body1" color="#666" mt={1}>
                  {perfilDetalhado.descricao || 'Sem descrição'}
                </Typography>
                <Box display="flex" gap={1} mt={2}>
                  <Chip 
                    label={`${perfilDetalhado.permissoes.length} permissões`}
                    color="primary"
                    size="small"
                  />
                  <Chip 
                    label={`ID: ${perfilDetalhado.perfil_id}`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Permissões */}
        <Card sx={{ mb: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={600} mb={3} color="#2c3e50">
              Permissões do Perfil
            </Typography>
            
            {perfilDetalhado.permissoes.length === 0 ? (
              <Box textAlign="center" py={4}>
                <CancelIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                <Typography variant="h6" color="#666">
                  Nenhuma permissão atribuída
                </Typography>
                <Typography variant="body2" color="#999">
                  Este perfil não possui permissões específicas
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Módulo</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50' }}>Incluir</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50' }}>Editar</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50' }}>Excluir</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {perfilDetalhado.permissoes.map((permissao, index) => (
                      <TableRow 
                        key={permissao.permissao_id} 
                        sx={{ 
                          '&:hover': { backgroundColor: '#f8f9fa' },
                          backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          {getModuloLabel(permissao.modulo)}
                        </TableCell>
                        <TableCell align="center">
                          {permissao.pode_incluir ? (
                            <CheckCircleIcon sx={{ color: '#4caf50' }} />
                          ) : (
                            <CancelIcon sx={{ color: '#ccc' }} />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {permissao.pode_editar ? (
                            <CheckCircleIcon sx={{ color: '#ff9800' }} />
                          ) : (
                            <CancelIcon sx={{ color: '#ccc' }} />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {permissao.pode_excluir ? (
                            <CheckCircleIcon sx={{ color: '#f44336' }} />
                          ) : (
                            <CancelIcon sx={{ color: '#ccc' }} />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getStatusText(permissao)}
                            color={getStatusColor(permissao) as any}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'flex-start',
          backgroundColor: 'white',
          p: 3,
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/perfil-usuario')}
            startIcon={<ArrowBackIcon />}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              borderColor: '#ddd',
              color: '#666',
              '&:hover': {
                borderColor: '#999',
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            Voltar
          </Button>
        </Box>

        {/* Snackbar para notificações */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Layout>
  );
}
