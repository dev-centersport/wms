import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  Alert,
  Snackbar,
  Divider,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { buscarPerfis, criarPerfil, atualizarPerfil, excluirPerfil, Perfil } from '../services/API';
import PermissaoGranular from '../components/PermissaoGranular';



interface ModuloPermissao {
  nome: string;
  label: string;
  icon: string;
  pode_ver: boolean;
  pode_add: boolean;
  pode_edit: boolean;
  pode_delete: boolean;
}



export default function PerfilUsuario() {
  const [perfis, setPerfis] = useState<Perfil[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPerfil, setEditingPerfil] = useState<Perfil | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
  });
  const [permissoes, setPermissoes] = useState<ModuloPermissao[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });
  const navigate = useNavigate();

  useEffect(() => {
    carregarPerfis();
    inicializarPermissoes();
  }, []);

  const carregarPerfis = async () => {
    try {
      const data = await buscarPerfis();
      setPerfis(data);
    } catch (error) {
      mostrarSnackbar('Erro ao carregar perfis', 'error');
    }
  };

  const inicializarPermissoes = () => {
    const modulos = [
      { nome: 'dashboard', label: 'Dashboard', icon: '📊' },
      { nome: 'armazem', label: 'Armazém', icon: '🏢' },
      { nome: 'tipo_localizacao', label: 'Tipo Localização', icon: '📍' },
      { nome: 'localizacao', label: 'Localização', icon: '🗺️' },
      { nome: 'produto', label: 'Produto', icon: '📦' },
      { nome: 'consulta', label: 'Consulta', icon: '🔍' },
      { nome: 'movimentacao', label: 'Movimentação', icon: '🔄' },
      { nome: 'transferencia', label: 'Transferência', icon: '📤' },
      { nome: 'separacao', label: 'Separação', icon: '📋' },
      { nome: 'ocorrencia', label: 'Ocorrência', icon: '⚠️' },
      { nome: 'auditoria', label: 'Auditoria', icon: '✅' },
      { nome: 'relatorios', label: 'Relatórios', icon: '📈' },
      { nome: 'usuarios', label: 'Usuários', icon: '👥' },
      { nome: 'perfis', label: 'Perfis', icon: '🔐' },
    ];

    const permissoesIniciais = modulos.map(modulo => ({
      nome: modulo.nome,
      label: modulo.label,
      icon: modulo.icon,
      pode_ver: true,
      pode_add: false,
      pode_edit: false,
      pode_delete: false,
    }));
    setPermissoes(permissoesIniciais);
  };

  const handleOpenDialog = (perfil?: Perfil) => {
    if (perfil) {
      setEditingPerfil(perfil);
      setFormData({
        nome: perfil.nome,
        descricao: perfil.descricao || '',
      });
    } else {
      setEditingPerfil(null);
      setFormData({
        nome: '',
        descricao: '',
      });
      inicializarPermissoes();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPerfil(null);
    setFormData({ nome: '', descricao: '' });
    inicializarPermissoes();
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      mostrarSnackbar('Nome do perfil é obrigatório', 'warning');
      return;
    }

    try {
      if (editingPerfil) {
        const perfilAtualizado = await atualizarPerfil(editingPerfil.perfil_id, {
          nome: formData.nome,
          descricao: formData.descricao,
        });
        setPerfis(prev => prev.map(p => p.perfil_id === editingPerfil.perfil_id ? perfilAtualizado : p));
        mostrarSnackbar('Perfil atualizado com sucesso!', 'success');
      } else {
        const novoPerfil = await criarPerfil({
          nome: formData.nome,
          descricao: formData.descricao,
        });
        setPerfis(prev => [...prev, novoPerfil]);
        mostrarSnackbar('Perfil criado com sucesso!', 'success');
      }

      handleCloseDialog();
    } catch (error) {
      mostrarSnackbar('Erro ao salvar perfil', 'error');
    }
  };

  const handleDelete = async (perfilId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este perfil?')) {
      try {
        await excluirPerfil(perfilId);
        setPerfis(prev => prev.filter(p => p.perfil_id !== perfilId));
        mostrarSnackbar('Perfil excluído com sucesso!', 'success');
      } catch (error) {
        mostrarSnackbar('Erro ao excluir perfil', 'error');
      }
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

  const handleSelectAll = (campo: keyof ModuloPermissao) => {
    const todosMarcados = permissoes.every(p => p[campo]);
    setPermissoes(prev =>
      prev.map(p => ({ ...p, [campo]: !todosMarcados }))
    );
  };

  const mostrarSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (perfil: Perfil) => {
    if (perfil.pode_add && perfil.pode_edit && perfil.pode_delete) return 'success';
    if (perfil.pode_edit) return 'warning';
    return 'info';
  };

  const getStatusText = (perfil: Perfil) => {
    if (perfil.pode_add && perfil.pode_edit && perfil.pode_delete) return 'Completo';
    if (perfil.pode_edit) return 'Edição';
    return 'Visualização';
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <SecurityIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={600} color="primary">
                Perfis de Usuário
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gerencie as permissões e acessos dos usuários
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
            }}
          >
            Novo Perfil
          </Button>
        </Box>

        {/* Cards dos Perfis */}
        <Grid container spacing={3} mb={4}>
          {perfis.map((perfil) => (
            <Grid item xs={12} sm={6} md={4} key={perfil.perfil_id}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={600} mb={1}>
                        {perfil.nome}
                      </Typography>
                      <Chip
                        label={getStatusText(perfil)}
                        color={getStatusColor(perfil) as any}
                        size="small"
                        icon={getStatusColor(perfil) === 'success' ? <CheckCircleIcon /> : <WarningIcon />}
                      />
                    </Box>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(perfil)}
                          sx={{ color: 'primary.main' }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(perfil.perfil_id)}
                          sx={{ color: 'error.main' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {perfil.descricao || 'Sem descrição'}
                  </Typography>

                  <Box display="flex" gap={1} flexWrap="wrap">
                    {perfil.pode_add && (
                      <Chip label="Criar" size="small" color="success" variant="outlined" />
                    )}
                    {perfil.pode_edit && (
                      <Chip label="Editar" size="small" color="warning" variant="outlined" />
                    )}
                    {perfil.pode_delete && (
                      <Chip label="Excluir" size="small" color="error" variant="outlined" />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Estatísticas */}
        <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Estatísticas dos Perfis
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary" fontWeight={700}>
                  {perfis.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total de Perfis
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h4" color="success.main" fontWeight={700}>
                  {perfis.filter(p => p.pode_add && p.pode_edit && p.pode_delete).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Perfis Completos
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box textAlign="center">
                <Typography variant="h4" color="warning.main" fontWeight={700}>
                  {perfis.filter(p => p.pode_edit && !p.pode_delete).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Perfis Limitados
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Dialog para Criar/Editar Perfil */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            },
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                <SecurityIcon />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                {editingPerfil ? 'Editar Perfil' : 'Novo Perfil de Usuário'}
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              {/* Informações Básicas */}
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight={600} mb={2} color="primary">
                  Informações do Perfil
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nome do Perfil"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Ex: Administrador, Separador, Auditor"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Descrição"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      placeholder="Descreva o propósito deste perfil"
                      variant="outlined"
                      multiline
                      rows={1}
                    />
                  </Grid>
                </Grid>
              </Grid>

                             <Grid item xs={12}>
                 <PermissaoGranular
                   permissoes={permissoes}
                   onPermissaoChange={handlePermissaoChange}
                   onSelectAll={handleSelectAll}
                 />
               </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              onClick={handleCloseDialog}
              startIcon={<CancelIcon />}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              startIcon={<SaveIcon />}
              variant="contained"
              sx={{
                borderRadius: 2,
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
              }}
            >
              {editingPerfil ? 'Atualizar' : 'Criar'} Perfil
            </Button>
          </DialogActions>
        </Dialog>

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