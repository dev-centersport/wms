import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Card,
  CardContent,
  Chip,
  Avatar,
  Tooltip,
} from '@mui/material';

import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { buscarPerfis, excluirPerfil, Perfil, PerfilBackend } from '../services/API';

export default function PerfilUsuario() {
  const [perfis, setPerfis] = useState<PerfilBackend[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
  const navigate = useNavigate();

  useEffect(() => {
    carregarPerfis();
  }, []);

  const carregarPerfis = async () => {
    setLoading(true);
    try {
      const data = await buscarPerfis();
      setPerfis(data);
    } catch (error) {
      // Dados de exemplo para demonstração
      const perfisExemplo: PerfilBackend[] = [
        {
          perfil_id: 1,
          nome: 'Administrador',
          descricao: 'Acesso completo ao sistema com todas as permissões',
          permissoes: [],
        },
        {
          perfil_id: 2,
          nome: 'Separador',
          descricao: 'Perfil para separação e expedição de produtos',
          permissoes: [],
        },
        {
          perfil_id: 3,
          nome: 'Auditor',
          descricao: 'Apenas visualização e auditoria de dados',
          permissoes: [],
        },
        {
          perfil_id: 4,
          nome: 'Operador',
          descricao: 'Operações básicas de movimentação',
          permissoes: [],
        },
      ];
      setPerfis(perfisExemplo);
      mostrarSnackbar('Usando dados de exemplo', 'info');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (perfilId: number, nomePerfil: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o perfil "${nomePerfil}"?`)) {
      try {
        await excluirPerfil(perfilId);
        setPerfis(prev => prev.filter(p => p.perfil_id !== perfilId));
        mostrarSnackbar('Perfil excluído com sucesso!', 'success');
      } catch (error) {
        mostrarSnackbar('Erro ao excluir perfil', 'error');
      }
    }
  };

  const handleEdit = (perfil: PerfilBackend) => {
    navigate('/perfil-usuario/editar', { state: { perfil } });
  };

  const handleCreate = () => {
    navigate('/perfil-usuario/criar');
  };

  const getStatusColor = (perfil: PerfilBackend) => {
    const temPermissaoCompleta = perfil.permissoes.some(p => p.pode_incluir && p.pode_editar && p.pode_excluir);
    const temPermissaoEdicao = perfil.permissoes.some(p => p.pode_editar);
    const temPermissaoVisualizacao = perfil.permissoes.length > 0;
    
    if (temPermissaoCompleta) return 'success';
    if (temPermissaoEdicao) return 'warning';
    if (temPermissaoVisualizacao) return 'info';
    return 'default';
  };

  const getStatusText = (perfil: PerfilBackend) => {
    const temPermissaoCompleta = perfil.permissoes.some(p => p.pode_incluir && p.pode_editar && p.pode_excluir);
    const temPermissaoEdicao = perfil.permissoes.some(p => p.pode_editar);
    const temPermissaoVisualizacao = perfil.permissoes.length > 0;
    
    if (temPermissaoCompleta) return 'Completo';
    if (temPermissaoEdicao) return 'Edição';
    if (temPermissaoVisualizacao) return 'Visualização';
    return 'Restrito';
  };

  const mostrarSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

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
            <SecurityIcon sx={{ color: '#4caf50', fontSize: 32 }} />
            <Box>
              <Typography variant="h4" fontWeight={600} color="#2c3e50">
                Perfis de Usuário
              </Typography>
              <Typography variant="body2" color="#666" mt={0.5}>
                Gerencie os perfis e permissões dos usuários do sistema
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            onClick={handleCreate}
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: '#4caf50',
              '&:hover': {
                backgroundColor: '#45a049',
              },
              px: 3,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            Criar Perfil
          </Button>
        </Box>

        {/* Lista de Perfis */}
        <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50', pl: 4 }}>Perfil</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Descrição</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50' }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50' }}>Usuários</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50' }}>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {perfis.map((perfil, index) => (
                    <TableRow 
                      key={perfil.perfil_id} 
                      sx={{ 
                        '&:hover': { backgroundColor: '#f8f9fa' },
                        backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
                      }}
                    >
                      <TableCell sx={{ pl: 4 }}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar sx={{ 
                            backgroundColor: '#4caf50',
                            width: 40,
                            height: 40
                          }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600} color="#2c3e50">
                              {perfil.nome}
                            </Typography>
                            <Typography variant="caption" color="#666">
                              ID: {perfil.perfil_id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="#2c3e50">
                          {perfil.descricao}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getStatusText(perfil)}
                          color={getStatusColor(perfil) as any}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={600} color="#2c3e50">
                          {perfil.permissoes.length}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          <Tooltip title="Editar perfil">
                            <IconButton
                              onClick={() => handleEdit(perfil)}
                              sx={{
                                color: '#2196f3',
                                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                '&:hover': {
                                  backgroundColor: 'rgba(33, 150, 243, 0.2)',
                                },
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Visualizar detalhes">
                            <IconButton
                              onClick={() => navigate('/perfil-usuario/visualizar', { state: { perfil } })}
                              sx={{
                                color: '#4caf50',
                                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                '&:hover': {
                                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                },
                              }}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir perfil">
                            <IconButton
                              onClick={() => handleDelete(perfil.perfil_id, perfil.nome)}
                              disabled={perfil.permissoes.length > 0}
                              sx={{
                                color: '#f44336',
                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                '&:hover': {
                                  backgroundColor: 'rgba(244, 67, 54, 0.2)',
                                },
                                '&.Mui-disabled': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                  color: 'rgba(0, 0, 0, 0.26)',
                                },
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

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