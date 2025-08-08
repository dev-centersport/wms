import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
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
  Checkbox,
  FormControlLabel,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';

import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  Security as SecurityIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  criarPerfil, 
  atualizarPerfil, 
  buscarPermissoes, 
  definirPermissoesDoPerfil,
  atualizarPermissao,
  PermissaoBackend,
  PerfilBackend
} from '../services/API';

interface ModuloPermissao {
  nome: string;
  label: string;
  pode_add: boolean;
  pode_edit: boolean;
  pode_delete: boolean;
}

export default function CriarPerfilUsuario() {
  const location = useLocation();
  const navigate = useNavigate();
  const isEditing = location.state?.perfil;
  
  const [formData, setFormData] = useState({
    nome: isEditing?.nome || '',
    descricao: isEditing?.descricao || '',
  });
  const [permissoes, setPermissoes] = useState<ModuloPermissao[]>([]);
  const [permissoesBackend, setPermissoesBackend] = useState<PermissaoBackend[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  useEffect(() => {
    inicializarPermissoes();
  }, []);

  const inicializarPermissoes = async () => {
    try {
      setLoading(true);
      
      // Buscar permissões do backend
      const permissoesBackend = await buscarPermissoes();
      setPermissoesBackend(permissoesBackend);
      
      const modulos = [
        { nome: 'armazem', label: 'Armazém' },
        { nome: 'tipo_localizacao', label: 'Tipo Localização' },
        { nome: 'localizacao', label: 'Localização' },
        { nome: 'movimentacao', label: 'Movimentação' },
        { nome: 'transferencia', label: 'Transferência' },
        { nome: 'ocorrencia', label: 'Ocorrência' },
        { nome: 'auditoria', label: 'Auditoria' },
        { nome: 'relatorio', label: 'Relatório' },
        { nome: 'usuario', label: 'Usuário' },
      ];

      const permissoesIniciais = modulos.map(modulo => {
        if (isEditing && isEditing.permissoes && isEditing.permissoes.length > 0) {
          // Se estamos editando, verificar se o perfil tem essa permissão
          const permissaoDoPerfil = isEditing.permissoes.find((p: PermissaoBackend) => p.modulo === modulo.nome);
          
          // Se encontrou a permissão no perfil, usar os valores dela
          if (permissaoDoPerfil) {
            return {
              nome: modulo.nome,
              label: modulo.label,
              pode_add: permissaoDoPerfil.pode_incluir,
              pode_edit: permissaoDoPerfil.pode_editar,
              pode_delete: permissaoDoPerfil.pode_excluir,
            };
          } else {
            // Se não encontrou, significa que o perfil não tem essa permissão
            return {
              nome: modulo.nome,
              label: modulo.label,
              pode_add: false,
              pode_edit: false,
              pode_delete: false,
            };
          }
        } else {
          // Se estamos criando, usar valores padrão (todos false)
          return {
            nome: modulo.nome,
            label: modulo.label,
            pode_add: false,
            pode_edit: false,
            pode_delete: false,
          };
        }
      });
      
      setPermissoes(permissoesIniciais);
    } catch (error) {
      console.error('Erro ao inicializar permissões:', error);
      mostrarSnackbar('Erro ao carregar permissões', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      mostrarSnackbar('Nome do perfil é obrigatório', 'error');
      return;
    }

    try {
      setLoading(true);
      
      let perfilCriado: PerfilBackend;
      
      if (isEditing) {
        // Atualizar perfil existente
        await atualizarPerfil(isEditing.perfil_id, {
          nome: formData.nome,
          descricao: formData.descricao,
        });
        
        // Criar/atualizar permissões específicas do perfil
        await criarOuAtualizarPermissoesDoPerfil(isEditing.perfil_id, permissoes);
        
        mostrarSnackbar('Perfil atualizado com sucesso!', 'success');
      } else {
        // Criar novo perfil
        perfilCriado = await criarPerfil({
          nome: formData.nome,
          descricao: formData.descricao,
        });
        
        // Criar/atualizar permissões específicas do perfil
        await criarOuAtualizarPermissoesDoPerfil(perfilCriado.perfil_id, permissoes);
        
        mostrarSnackbar('Perfil criado com sucesso!', 'success');
      }
      
      // Voltar para a listagem
      setTimeout(() => {
        navigate('/perfil-usuario');
      }, 1500);
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      mostrarSnackbar(`Erro ao ${isEditing ? 'atualizar' : 'criar'} perfil`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Função para associar permissões ao perfil
  const criarOuAtualizarPermissoesDoPerfil = async (perfilId: number, permissoesFrontend: ModuloPermissao[]) => {
    try {
      // Coletar IDs das permissões que devem ser associadas ao perfil
      const permissoesParaAssociar: number[] = [];
      
      for (const permissao of permissoesFrontend) {
        if (permissao.pode_add || permissao.pode_edit || permissao.pode_delete) {
          // Buscar permissão existente do módulo
          const permissaoExistente = permissoesBackend.find(pb => pb.modulo === permissao.nome);
          
          if (permissaoExistente) {
            // Se a permissão existente tem os valores corretos, usar ela
            if (permissaoExistente.pode_incluir === permissao.pode_add &&
                permissaoExistente.pode_editar === permissao.pode_edit &&
                permissaoExistente.pode_excluir === permissao.pode_delete) {
              permissoesParaAssociar.push(permissaoExistente.permissao_id);
            } else {
              // Se os valores são diferentes, atualizar a permissão existente
              await atualizarPermissao(permissaoExistente.permissao_id, {
                pode_incluir: permissao.pode_add,
                pode_editar: permissao.pode_edit,
                pode_excluir: permissao.pode_delete,
              });
              permissoesParaAssociar.push(permissaoExistente.permissao_id);
            }
          } else {
            // Se não existe permissão para este módulo, pular (não criar novas permissões)
            console.warn(`Permissão para módulo ${permissao.nome} não encontrada. Pulando...`);
          }
        }
      }
      
      // Associar todas as permissões ao perfil de uma vez
      if (permissoesParaAssociar.length > 0) {
        await definirPermissoesDoPerfil(perfilId, permissoesParaAssociar);
      }
    } catch (error) {
      console.error('Erro ao criar/atualizar permissões do perfil:', error);
      throw error;
    }
  };

  const handlePermissaoChange = (moduloNome: string, campo: keyof ModuloPermissao, valor: boolean) => {
    setPermissoes(prev =>
      prev.map(p =>
        p.nome === moduloNome
          ? { ...p, [campo]: valor }
          : p
      )
    );
  };

  // Funções para selecionar colunas inteiras
  const selecionarColunaAdd = () => {
    setPermissoes(prev =>
      prev.map(p => ({ ...p, pode_add: true }))
    );
  };

  const selecionarColunaEdit = () => {
    setPermissoes(prev =>
      prev.map(p => ({ ...p, pode_edit: true }))
    );
  };

  const selecionarColunaDelete = () => {
    setPermissoes(prev =>
      prev.map(p => ({ ...p, pode_delete: true }))
    );
  };

  const limparColunaAdd = () => {
    setPermissoes(prev =>
      prev.map(p => ({ ...p, pode_add: false }))
    );
  };

  const limparColunaEdit = () => {
    setPermissoes(prev =>
      prev.map(p => ({ ...p, pode_edit: false }))
    );
  };

  const limparColunaDelete = () => {
    setPermissoes(prev =>
      prev.map(p => ({ ...p, pode_delete: false }))
    );
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
                {isEditing ? 'Editar Perfil de Usuário' : 'Criar Perfil de Usuário'}
              </Typography>
              <Typography variant="body2" color="#666" mt={0.5}>
                {isEditing ? 'Modifique as informações e permissões do perfil' : 'Configure um novo perfil com suas permissões'}
              </Typography>
            </Box>
          </Box>
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
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Formulário Principal */}
        <Card sx={{ mb: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={600} mb={3} color="#2c3e50">
              Informações do Perfil
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Nome do perfil"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Separador"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#4caf50',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#4caf50',
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Descrição do Perfil"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Ex: Separador expedicao"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#4caf50',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#4caf50',
                    },
                  },
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Seção de Permissões */}
        <Card sx={{ mb: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={600} mb={3} color="#2c3e50">
              Permissões e ações
            </Typography>
            
            <TableContainer 
              component={Paper} 
              sx={{ 
                mb: 3,
                boxShadow: 'none',
                border: '1px solid #e0e0e0',
                borderRadius: 2
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Módulo</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50' }}>Pode incluir</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50' }}>Pode editar</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#2c3e50' }}>Pode excluir</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {permissoes.map((permissao, index) => (
                    <TableRow 
                      key={permissao.nome} 
                      sx={{ 
                        '&:hover': { backgroundColor: '#f8f9fa' },
                        backgroundColor: index % 2 === 0 ? 'white' : '#fafafa'
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500, color: '#2c3e50' }}>
                        {permissao.label}
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={permissao.pode_add}
                          onChange={(e) => handlePermissaoChange(permissao.nome, 'pode_add', e.target.checked)}
                          sx={{
                            color: '#4caf50',
                            '&.Mui-checked': {
                              color: '#4caf50',
                            },
                            '&:hover': {
                              backgroundColor: 'rgba(76, 175, 80, 0.1)',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={permissao.pode_edit}
                          onChange={(e) => handlePermissaoChange(permissao.nome, 'pode_edit', e.target.checked)}
                          sx={{
                            color: '#ff9800',
                            '&.Mui-checked': {
                              color: '#ff9800',
                            },
                            '&:hover': {
                              backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={permissao.pode_delete}
                          onChange={(e) => handlePermissaoChange(permissao.nome, 'pode_delete', e.target.checked)}
                          sx={{
                            color: '#f44336',
                            '&.Mui-checked': {
                              color: '#f44336',
                            },
                            '&:hover': {
                              backgroundColor: 'rgba(244, 67, 54, 0.1)',
                            },
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Botões para selecionar/limpar colunas inteiras */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: 2, 
              mt: 3,
              mb: 3
            }}>
              <Button
                variant="outlined"
                onClick={selecionarColunaAdd}
                startIcon={<Checkbox checked={permissoes.every(p => p.pode_add)} />}
                sx={{
                  borderColor: '#4caf50',
                  color: '#4caf50',
                  '&:hover': {
                    borderColor: '#45a049',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  },
                }}
              >
                Selecionar Todos (Incluir)
              </Button>
              <Button
                variant="outlined"
                onClick={limparColunaAdd}
                startIcon={<Checkbox checked={permissoes.every(p => !p.pode_add)} />}
                sx={{
                  borderColor: '#4caf50',
                  color: '#4caf50',
                  '&:hover': {
                    borderColor: '#45a049',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  },
                }}
              >
                Limpar Todos (Incluir)
              </Button>
              <Button
                variant="outlined"
                onClick={selecionarColunaEdit}
                startIcon={<Checkbox checked={permissoes.every(p => p.pode_edit)} />}
                sx={{
                  borderColor: '#ff9800',
                  color: '#ff9800',
                  '&:hover': {
                    borderColor: '#f57c00',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                  },
                }}
              >
                Selecionar Todos (Editar)
              </Button>
              <Button
                variant="outlined"
                onClick={limparColunaEdit}
                startIcon={<Checkbox checked={permissoes.every(p => !p.pode_edit)} />}
                sx={{
                  borderColor: '#ff9800',
                  color: '#ff9800',
                  '&:hover': {
                    borderColor: '#f57c00',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                  },
                }}
              >
                Limpar Todos (Editar)
              </Button>
              <Button
                variant="outlined"
                onClick={selecionarColunaDelete}
                startIcon={<Checkbox checked={permissoes.every(p => p.pode_delete)} />}
                sx={{
                  borderColor: '#f44336',
                  color: '#f44336',
                  '&:hover': {
                    borderColor: '#e53935',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  },
                }}
              >
                Selecionar Todos (Excluir)
              </Button>
              <Button
                variant="outlined"
                onClick={limparColunaDelete}
                startIcon={<Checkbox checked={permissoes.every(p => !p.pode_delete)} />}
                sx={{
                  borderColor: '#f44336',
                  color: '#f44336',
                  '&:hover': {
                    borderColor: '#e53935',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                  },
                }}
              >
                Limpar Todos (Excluir)
              </Button>
            </Box>

            {/* Movimentação Padrão */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 3,
              p: 3,
              backgroundColor: '#f8f9fa',
              borderRadius: 2,
              border: '1px solid #e0e0e0'
            }}>
              <Typography variant="subtitle1" fontWeight={600} color="#2c3e50">
                Movimentação Padrão:
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    defaultChecked={false}
                    sx={{
                      color: '#2196f3',
                      '&.Mui-checked': {
                        color: '#2196f3',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                      },
                    }}
                  />
                }
                label="Entrada"
                sx={{ color: '#2c3e50' }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    defaultChecked={true}
                    sx={{
                      color: '#2196f3',
                      '&.Mui-checked': {
                        color: '#2196f3',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                      },
                    }}
                  />
                }
                label="Saida"
                sx={{ color: '#2c3e50' }}
              />
            </Box>
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
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            startIcon={<SaveIcon />}
            sx={{
              backgroundColor: '#4caf50',
              '&:hover': {
                backgroundColor: '#45a049',
              },
              '&:disabled': {
                backgroundColor: '#ccc',
              },
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar')}
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/perfil-usuario')}
            startIcon={<CancelIcon />}
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
            Cancelar
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