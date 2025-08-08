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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';

import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Group as GroupIcon,
  Close as CloseIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { buscarPerfis, excluirPerfil, buscarUsuariosPorPerfil, Perfil, PerfilBackend } from '../services/API';

export default function PerfilUsuario() {
  const [perfis, setPerfis] = useState<PerfilBackend[]>([]);
  const [usuariosPorPerfil, setUsuariosPorPerfil] = useState<{[key: number]: any[]}>({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPerfil, setSelectedPerfil] = useState<PerfilBackend | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(25);
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
      
      // Carregar usuários para cada perfil
      await carregarUsuariosPorPerfil(data);
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

  const carregarUsuariosPorPerfil = async (perfisData: PerfilBackend[]) => {
    try {
      const usuariosMap: {[key: number]: any[]} = {};
      
      for (const perfil of perfisData) {
        try {
          const usuarios = await buscarUsuariosPorPerfil(perfil.perfil_id);
          usuariosMap[perfil.perfil_id] = usuarios;
        } catch (error) {
          console.error(`Erro ao carregar usuários do perfil ${perfil.perfil_id}:`, error);
          usuariosMap[perfil.perfil_id] = [];
        }
      }
      
      setUsuariosPorPerfil(usuariosMap);
    } catch (error) {
      console.error('Erro ao carregar usuários por perfil:', error);
    }
  };

  const handleDelete = async (perfilId: number, nomePerfil: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o perfil "${nomePerfil}"?`)) {
      try {
        await excluirPerfil(perfilId);
        setPerfis(prev => prev.filter(p => p.perfil_id !== perfilId));
        // Remover usuários do perfil excluído do estado
        setUsuariosPorPerfil(prev => {
          const newState = { ...prev };
          delete newState[perfilId];
          return newState;
        });
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

  const handleRefresh = () => {
    carregarPerfis();
  };

  const handleOpenModal = (perfil: PerfilBackend) => {
    setSelectedPerfil(perfil);
    setCurrentPage(1); // Reset to first page when opening modal
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPerfil(null);
    setCurrentPage(1); // Reset pagination
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const handleUsersPerPageChange = (event: SelectChangeEvent<number>) => {
    setUsersPerPage(Number(event.target.value));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Calculate pagination
  const getCurrentUsers = () => {
    if (!selectedPerfil || !usuariosPorPerfil[selectedPerfil.perfil_id]) {
      return [];
    }
    
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return usuariosPorPerfil[selectedPerfil.perfil_id].slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    if (!selectedPerfil || !usuariosPorPerfil[selectedPerfil.perfil_id]) {
      return 0;
    }
    return Math.ceil(usuariosPorPerfil[selectedPerfil.perfil_id].length / usersPerPage);
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
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
              disabled={loading}
              sx={{
                borderColor: '#4caf50',
                color: '#4caf50',
                '&:hover': {
                  borderColor: '#45a049',
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                },
                px: 3,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              {loading ? 'Carregando...' : 'Atualizar'}
            </Button>
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
                        <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
                          {loading ? (
                            <Typography variant="body2" color="#666">
                              Carregando...
                            </Typography>
                          ) : (
                            <>
                              <Typography variant="body2" fontWeight={600} color="#2c3e50">
                                {usuariosPorPerfil[perfil.perfil_id]?.length || 0} usuários
                              </Typography>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<GroupIcon />}
                                onClick={() => handleOpenModal(perfil)}
                                disabled={!usuariosPorPerfil[perfil.perfil_id] || usuariosPorPerfil[perfil.perfil_id].length === 0}
                                sx={{
                                  borderColor: '#4caf50',
                                  color: '#4caf50',
                                  fontSize: '0.75rem',
                                  py: 0.5,
                                  px: 1.5,
                                  minWidth: 'auto',
                                  '&:hover': {
                                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                  },
                                  '&.Mui-disabled': {
                                    borderColor: 'rgba(0, 0, 0, 0.12)',
                                    color: 'rgba(0, 0, 0, 0.26)',
                                  },
                                }}
                              >
                                Ver Usuários
                              </Button>
                            </>
                          )}
                        </Box>
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

        {/* Modal para exibir usuários do perfil */}
        <Dialog
          open={modalOpen}
          onClose={handleCloseModal}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }
          }}
        >
          <DialogTitle sx={{ 
            backgroundColor: '#4caf50', 
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 3,
            py: 2
          }}>
            <Box display="flex" alignItems="center" gap={2}>
              <GroupIcon />
              <Typography variant="h6" fontWeight={600}>
                Usuários do Perfil: {selectedPerfil?.nome}
              </Typography>
            </Box>
            <IconButton
              onClick={handleCloseModal}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 0 }}>
            {selectedPerfil && usuariosPorPerfil[selectedPerfil.perfil_id] && (
              <>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#2c3e50', pl: 3 }}>Usuário</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>CPF</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Nível</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getCurrentUsers().map((usuario: any, index: number) => (
                          <TableRow 
                            key={usuario.usuario_id}
                            sx={{ 
                              '&:hover': { backgroundColor: '#f8f9fa' },
                              backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
                            }}
                          >
                            <TableCell sx={{ pl: 3 }}>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ 
                                  backgroundColor: '#4caf50',
                                  width: 36,
                                  height: 36
                                }}>
                                  <PersonIcon />
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2" fontWeight={600} color="#2c3e50">
                                    {usuario.responsavel}
                                  </Typography>
                                  <Typography variant="caption" color="#666">
                                    {usuario.usuario}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="#2c3e50">
                                {usuario.cpf || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`Nível ${usuario.nivel || 1}`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: '0.7rem',
                                  borderColor: '#4caf50',
                                  color: '#4caf50',
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label="Ativo"
                                size="small"
                                color="success"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
                
                {/* Pagination Controls */}
                {getTotalPages() > 1 && (
                  <Box sx={{ 
                    p: 2, 
                    borderTop: '1px solid #e0e0e0',
                    backgroundColor: '#f8f9fa',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2
                  }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography variant="body2" color="#666">
                        Mostrando {((currentPage - 1) * usersPerPage) + 1} a {Math.min(currentPage * usersPerPage, usuariosPorPerfil[selectedPerfil.perfil_id]?.length || 0)} de {usuariosPorPerfil[selectedPerfil.perfil_id]?.length || 0} usuários
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={2}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={usersPerPage}
                          onChange={handleUsersPerPageChange}
                          sx={{
                            '& .MuiSelect-select': {
                              py: 1,
                              px: 2,
                            },
                          }}
                        >
                          <MenuItem value={10}>10 por página</MenuItem>
                          <MenuItem value={25}>25 por página</MenuItem>
                          <MenuItem value={50}>50 por página</MenuItem>
                          <MenuItem value={100}>100 por página</MenuItem>
                        </Select>
                      </FormControl>
                      
                      <Pagination
                        count={getTotalPages()}
                        page={currentPage}
                        onChange={handlePageChange}
                        size="small"
                        showFirstButton
                        showLastButton
                        sx={{
                          '& .MuiPaginationItem-root': {
                            borderRadius: 1,
                            mx: 0.5,
                          },
                          '& .Mui-selected': {
                            backgroundColor: '#4caf50',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#45a049',
                            },
                          },
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </>
            )}
          </DialogContent>
          
          <DialogActions sx={{ p: 3, backgroundColor: '#f8f9fa' }}>
            <Button
              onClick={handleCloseModal}
              variant="contained"
              sx={{
                backgroundColor: '#4caf50',
                '&:hover': {
                  backgroundColor: '#45a049',
                },
                px: 3,
                py: 1,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Fechar
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  );
} 