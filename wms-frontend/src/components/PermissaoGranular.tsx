import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  Typography,
  Chip,
  Divider,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

interface PermissaoModulo {
  nome: string;
  label: string;
  icon: string;
  pode_ver: boolean;
  pode_add: boolean;
  pode_edit: boolean;
  pode_delete: boolean;
}

interface PermissaoGranularProps {
  permissoes: PermissaoModulo[];
  onPermissaoChange: (moduloNome: string, campo: keyof Omit<PermissaoModulo, 'nome' | 'label' | 'icon'>, valor: boolean) => void;
  onSelectAll: (campo: keyof Omit<PermissaoModulo, 'nome' | 'label' | 'icon'>) => void;
}

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

export default function PermissaoGranular({ permissoes, onPermissaoChange, onSelectAll }: PermissaoGranularProps) {
  const getStatusColor = (permissao: PermissaoModulo) => {
    if (permissao.pode_add && permissao.pode_edit && permissao.pode_delete) return 'success';
    if (permissao.pode_edit) return 'warning';
    return 'info';
  };

  const getStatusText = (permissao: PermissaoModulo) => {
    if (permissao.pode_add && permissao.pode_edit && permissao.pode_delete) return 'Completo';
    if (permissao.pode_edit) return 'Edição';
    return 'Visualização';
  };

  const getPermissaoCount = (campo: keyof Omit<PermissaoModulo, 'nome' | 'label' | 'icon'>) => {
    return permissoes.filter(p => p[campo]).length;
  };

  return (
    <Box>
      {/* Header com estatísticas */}
      <Box mb={3}>
        <Typography variant="h6" fontWeight={600} mb={2} color="primary">
          <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Permissões por Módulo
        </Typography>
        
        <Grid container spacing={2} mb={2}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="h6" color="primary" fontWeight={700}>
                {getPermissaoCount('pode_ver')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Visualização
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="h6" color="success.main" fontWeight={700}>
                {getPermissaoCount('pode_add')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Criação
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="h6" color="warning.main" fontWeight={700}>
                {getPermissaoCount('pode_edit')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Edição
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ textAlign: 'center', p: 1 }}>
              <Typography variant="h6" color="error.main" fontWeight={700}>
                {getPermissaoCount('pode_delete')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Exclusão
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* Botões de ação rápida */}
        <Box display="flex" gap={1} flexWrap="wrap">
          <Tooltip title="Marcar/Desmarcar todos os módulos para visualização">
            <Button
              size="small"
              variant="outlined"
              onClick={() => onSelectAll('pode_ver')}
              startIcon={<VisibilityIcon />}
            >
              Visualizar ({getPermissaoCount('pode_ver')}/{permissoes.length})
            </Button>
          </Tooltip>
          <Tooltip title="Marcar/Desmarcar todos os módulos para criação">
            <Button
              size="small"
              variant="outlined"
              onClick={() => onSelectAll('pode_add')}
              startIcon={<AddIcon />}
            >
              Criar ({getPermissaoCount('pode_add')}/{permissoes.length})
            </Button>
          </Tooltip>
          <Tooltip title="Marcar/Desmarcar todos os módulos para edição">
            <Button
              size="small"
              variant="outlined"
              onClick={() => onSelectAll('pode_edit')}
              startIcon={<EditIcon />}
            >
              Editar ({getPermissaoCount('pode_edit')}/{permissoes.length})
            </Button>
          </Tooltip>
          <Tooltip title="Marcar/Desmarcar todos os módulos para exclusão">
            <Button
              size="small"
              variant="outlined"
              onClick={() => onSelectAll('pode_delete')}
              startIcon={<DeleteIcon />}
            >
              Excluir ({getPermissaoCount('pode_delete')}/{permissoes.length})
            </Button>
          </Tooltip>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Grid de módulos */}
      <Grid container spacing={2}>
        {permissoes.map((permissao) => (
          <Grid item xs={12} sm={6} md={4} key={permissao.nome}>
            <Card
              sx={{
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                },
                border: '1px solid',
                borderColor: getStatusColor(permissao) === 'success' ? 'success.main' : 'divider',
              }}
            >
              <CardContent sx={{ p: 2 }}>
                {/* Header do módulo */}
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <span style={{ fontSize: '1.5em' }}>{permissao.icon}</span>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {permissao.label}
                    </Typography>
                  </Box>
                  <Chip
                    label={getStatusText(permissao)}
                    color={getStatusColor(permissao) as any}
                    size="small"
                    icon={getStatusColor(permissao) === 'success' ? <CheckCircleIcon /> : <WarningIcon />}
                  />
                </Box>

                {/* Checkboxes de permissões */}
                <Box display="flex" flexDirection="column" gap={1}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={permissao.pode_ver}
                        onChange={(e) => onPermissaoChange(permissao.nome, 'pode_ver', e.target.checked)}
                        color="primary"
                        size="small"
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <VisibilityIcon fontSize="small" />
                        <Typography variant="caption">Visualizar</Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={permissao.pode_add}
                        onChange={(e) => onPermissaoChange(permissao.nome, 'pode_add', e.target.checked)}
                        color="success"
                        size="small"
                        disabled={!permissao.pode_ver}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <AddIcon fontSize="small" />
                        <Typography variant="caption">Criar</Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={permissao.pode_edit}
                        onChange={(e) => onPermissaoChange(permissao.nome, 'pode_edit', e.target.checked)}
                        color="warning"
                        size="small"
                        disabled={!permissao.pode_ver}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <EditIcon fontSize="small" />
                        <Typography variant="caption">Editar</Typography>
                      </Box>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={permissao.pode_delete}
                        onChange={(e) => onPermissaoChange(permissao.nome, 'pode_delete', e.target.checked)}
                        color="error"
                        size="small"
                        disabled={!permissao.pode_ver}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <DeleteIcon fontSize="small" />
                        <Typography variant="caption">Excluir</Typography>
                      </Box>
                    }
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
} 