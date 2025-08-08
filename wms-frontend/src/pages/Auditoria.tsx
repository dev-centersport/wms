import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  TableSortLabel,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  LinearProgress,
  Badge,
  Divider,
  Alert,
  Snackbar,
  Fab,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material';
import {
  Search,
  Add,
  CheckCircle,
  Cancel,
  Delete as DeleteIcon,
  PlayArrow,
  FilterList,
  Refresh,
  Assessment,
  Warehouse,
  LocationOn,
  Person,
  Schedule,
  TrendingUp,
  Warning,
  Info,
  Visibility,
  Edit,
  Archive,
  Download,
  Print,
  Share,
  MoreVert,
  Close,
  Check,
  Block,
  PendingActions,
  Assignment,
  Inventory,
  QrCodeScanner,
  Analytics
} from '@mui/icons-material';
import Layout from '../components/Layout';
import { BotaoComPermissao } from '../components/BotaoComPermissao';

import { buscarAuditoria, buscarArmazemPorEAN, iniciarAuditoria, buscarProdutosAuditoria, cancelarAuditoria } from '../services/API';


interface Ocorrencia {
  ocorrencia_id: number;
  dataHora: string;
  ativo: boolean;
}

export interface AuditoriaItem {
  auditoria_id: number;
  conclusao: string;
  data_hora_inicio: string;
  data_hora_conclusao: string;
  status: 'pendente' | 'concluida' | 'em andamento' | 'cancelada';
  usuario: {
    responsavel: string;
  };
  localizacao: {
    nome: string;
    ean: string;
  };
  ocorrencias: Ocorrencia[];
  armazem?: {
    nome: string;
  };
  qtdOcorrencias?: number;
}

const ITEMS_PER_PAGE = 12;

export default function Auditoria() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [aba, setAba] = useState<'todos' | 'pendente' | 'concluida' | 'em andamento' | 'cancelada'>('todos');
  const [auditorias, setAuditorias] = useState<AuditoriaItem[]>([]);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [filtroArmazem, setFiltroArmazem] = useState('');
  const [appliedFiltroArmazem, setAppliedFiltroArmazem] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [appliedFiltroStatus, setAppliedFiltroStatus] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [modalIniciar, setModalIniciar] = useState<AuditoriaItem | null>(null);
  const [modalConferir, setModalConferir] = useState<AuditoriaItem | null>(null);
  const [modalCancelar, setModalCancelar] = useState<{ open: boolean; auditoria?: AuditoriaItem }>({ open: false });
  const [ocorrenciasModal, setOcorrenciasModal] = useState<{
    open: boolean;
    ocorrencias: Ocorrencia[];
    localizacao: string;
  }>({
    open: false,
    ocorrencias: [],
    localizacao: '',
  });
  const [orderBy, setOrderBy] = useState<string>('data_hora_inicio');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Estatísticas
  const [stats, setStats] = useState({
    total: 0,
    pendentes: 0,
    emAndamento: 0,
    concluidas: 0,
    canceladas: 0
  });

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && orderDirection === 'asc';
    setOrderDirection(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        const dados = await buscarAuditoria({
          search: busca,
          offset: (paginaAtual - 1) * ITEMS_PER_PAGE,
          limit: ITEMS_PER_PAGE,
          status: aba === 'pendente' || aba === 'concluida' || aba === 'em andamento' || aba === 'cancelada' ? aba : undefined,
        });

        const lista: AuditoriaItem[] = Array.isArray(dados)
          ? dados
          : Array.isArray(dados.results)
            ? dados.results
            : [];

        // Buscar quantidade de ocorrências de cada auditoria
        const auditoriasComOcorrencias = await Promise.all(
          lista.map(async (aud) => {
            let nomeArmazem = '-';
            if (aud.localizacao.ean) {
              const armazemEncontrado = await buscarArmazemPorEAN(aud.localizacao.ean);
              nomeArmazem = armazemEncontrado?.nome || '-';
            }

            let qtdOcorrencias = 0;
            try {
              const ocorrencias = await buscarProdutosAuditoria(aud.auditoria_id);
              qtdOcorrencias = Array.isArray(ocorrencias) ? ocorrencias.length : 0;
            } catch {
              qtdOcorrencias = 0;
            }

            return {
              ...aud,
              data_hora_inicio: aud.data_hora_inicio ? formatarData(aud.data_hora_inicio) : '-',
              data_hora_conclusao: aud.data_hora_conclusao ? formatarData(aud.data_hora_conclusao) : '-',
              localizacao: {
                nome: aud.localizacao.nome || '-',
                ean: aud.localizacao.ean || '',
              },
              armazem: { nome: nomeArmazem },
              qtdOcorrencias,
            };
          })
        );

        setAuditorias(auditoriasComOcorrencias);
        setSelecionados([]);

        // Calcular estatísticas
        const total = auditoriasComOcorrencias.length;
        const pendentes = auditoriasComOcorrencias.filter(a => a.status === 'pendente').length;
        const emAndamento = auditoriasComOcorrencias.filter(a => a.status === 'em andamento').length;
        const concluidas = auditoriasComOcorrencias.filter(a => a.status === 'concluida').length;
        const canceladas = auditoriasComOcorrencias.filter(a => a.status === 'cancelada').length;

        setStats({ total, pendentes, emAndamento, concluidas, canceladas });

      } catch (err) {
        console.error('Erro ao carregar auditorias:', err);
        showSnackbar('Erro ao carregar auditorias', 'error');
      } finally {
        setLoading(false);
      }
    }

    carregar();
  }, [aba, busca, paginaAtual]);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleAplicarFiltro = () => {
    setAppliedFiltroArmazem(filtroArmazem);
    setAppliedFiltroStatus(filtroStatus);
    setPaginaAtual(1);
    handleMenuClose();
  };

  const handleLimparFiltro = () => {
    setFiltroArmazem('');
    setFiltroStatus('');
    setAppliedFiltroArmazem('');
    setAppliedFiltroStatus('');
    setPaginaAtual(1);
    handleMenuClose();
  };

  function formatarData(dataString: string | Date) {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
  }

  const abrirModalOcorrencias = (ocorrencias: Ocorrencia[], localizacao: string) => {
    setOcorrenciasModal({
      open: true,
      ocorrencias,
      localizacao,
    });
  };

  const fecharModalOcorrencias = () => {
    setOcorrenciasModal({
      open: false,
      ocorrencias: [],
      localizacao: '',
    });
  };

  const handleIniciarConferencia = async (auditoriaId: number) => {
    try {
      await iniciarAuditoria(auditoriaId);
      setModalIniciar(null);
      showSnackbar('Auditoria iniciada com sucesso!', 'success');
      navigate(`/ConferenciaAudi/${auditoriaId}`);
    } catch (error: any) {
      showSnackbar(`Erro ao iniciar conferência: ${error.message}`, 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const filtrado = useMemo(() => {
    const termo = busca.toLowerCase();
    return auditorias.filter(aud => {
      const statusMatch = !appliedFiltroStatus || aud.status === appliedFiltroStatus;
      const armazemMatch = !appliedFiltroArmazem || aud.armazem?.nome === appliedFiltroArmazem;
      const buscaMatch =
        aud.usuario.responsavel.toLowerCase().includes(termo) ||
        aud.auditoria_id.toString().includes(termo) ||
        aud.localizacao.nome.toLowerCase().includes(termo);

      return statusMatch && armazemMatch && buscaMatch;
    });
  }, [auditorias, busca, appliedFiltroStatus, appliedFiltroArmazem]);

  const totalPaginas = Math.ceil(filtrado.length / ITEMS_PER_PAGE) || 1;
  const exibidos = filtrado.slice(
    (paginaAtual - 1) * ITEMS_PER_PAGE,
    paginaAtual * ITEMS_PER_PAGE
  );

  const toggleSelecionado = (id: number) => {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const onClickIniciar = (item: AuditoriaItem) => {
    if (item.status === 'cancelada') {
      showSnackbar("Esta auditoria foi cancelada", 'warning');
      return;
    }
    if (item.status === 'concluida') {
      showSnackbar("Esta auditoria já foi concluída", 'warning');
      return;
    }
    if (item.status === 'em andamento') {
      showSnackbar("Esta auditoria já foi iniciada", 'warning');
      return;
    }
    setModalIniciar(item);
  };

  const onClickConferir = (item: AuditoriaItem) => {
    if (item.status === 'cancelada') {
      showSnackbar("Esta auditoria foi cancelada", 'warning');
      return;
    }
    if (item.status === 'concluida') {
      showSnackbar("Esta auditoria já foi concluída", 'warning');
      return;
    }
    if (item.status === 'pendente') {
      showSnackbar("Esta auditoria não foi iniciada!", 'warning');
      return;
    }
    setModalConferir(item);
  };

  const handleCancelar = async (auditoriaId: number) => {
    try {
      await cancelarAuditoria(auditoriaId);
      setModalCancelar({ open: false });
      showSnackbar('Auditoria cancelada com sucesso!', 'success');
      // Recarregar dados
      window.location.reload();
    } catch (error: any) {
      showSnackbar(error?.response?.data?.message || 'Erro ao cancelar auditoria.', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return '#FF9800';
      case 'em andamento': return '#2196F3';
      case 'concluida': return '#4CAF50';
      case 'cancelada': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return <PendingActions />;
      case 'em andamento': return <TrendingUp />;
      case 'concluida': return <CheckCircle />;
      case 'cancelada': return <Cancel />;
      default: return <Info />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'em andamento': return 'Em Andamento';
      case 'concluida': return 'Concluída';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const speedDialActions = [
    { icon: <Add />, name: 'Nova Auditoria', action: () => console.log('Nova Auditoria') },
    { icon: <Download />, name: 'Exportar', action: () => console.log('Exportar') },
    { icon: <Print />, name: 'Imprimir', action: () => console.log('Imprimir') },
    { icon: <Analytics />, name: 'Relatórios', action: () => console.log('Relatórios') },
  ];

  if (loading) {
    return (
      <Layout>
        <Box p={3}>
          <LinearProgress />
          <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
            Carregando auditorias...
          </Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout totalPages={totalPaginas} currentPage={paginaAtual} onPageChange={setPaginaAtual}>
      {/* Header com estatísticas */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 3, color: '#32CD32' }}>
          <Assessment sx={{ mr: 1, verticalAlign: 'middle', fontSize: 50 }} />
          Gestão de Auditorias
        </Typography>

        {/* Cards de estatísticas */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
          gap: 3, 
          mb: 4 
        }}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" fontWeight={700}>{stats.total}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Total de Auditorias</Typography>
            </CardContent>
          </Card>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(255, 154, 158, 0.3)'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" fontWeight={700}>{stats.pendentes}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Pendentes</Typography>
            </CardContent>
          </Card>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(168, 237, 234, 0.3)'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" fontWeight={700}>{stats.emAndamento}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Em Andamento</Typography>
            </CardContent>
          </Card>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(255, 236, 210, 0.3)'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" fontWeight={700}>{stats.concluidas}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Concluídas</Typography>
            </CardContent>
          </Card>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
            color: 'white',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(255, 154, 158, 0.3)'
          }}>
            <CardContent sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" fontWeight={700}>{stats.canceladas}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Canceladas</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Barra de ferramentas */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center', 
          mb: 3, 
          flexWrap: 'wrap',
          p: 2,
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
          border: '1px solid #e0e0e0'
        }}>
          <TextField
            placeholder="Buscar por usuário, ID ou localização..."
            size="small"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#666' }} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              width: 300,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'white'
              }
            }}
          />

          <Button
            variant="outlined"
            onClick={handleMenuOpen}
            startIcon={<FilterList />}
            sx={{
              borderRadius: 2,
              borderColor: appliedFiltroArmazem || appliedFiltroStatus ? '#1976d2' : '#ccc',
              color: appliedFiltroArmazem || appliedFiltroStatus ? '#1976d2' : '#666',
              fontWeight: appliedFiltroArmazem || appliedFiltroStatus ? 'bold' : 'normal',
            }}
          >
            Filtros
          </Button>

          <Button
            variant="outlined"
            onClick={() => window.location.reload()}
            startIcon={<Refresh />}
            sx={{ borderRadius: 2 }}
          >
            Atualizar
          </Button>

          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <Button
              variant={viewMode === 'cards' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('cards')}
              sx={{ borderRadius: 2, minWidth: 100 }}
            >
              Cards
            </Button>
            <Button
              variant={viewMode === 'table' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('table')}
              sx={{ borderRadius: 2, minWidth: 100 }}
            >
              Tabela
            </Button>
          </Box>
        </Box>

        {/* Chips de filtros aplicados */}
        {(appliedFiltroArmazem || appliedFiltroStatus) && (
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            {appliedFiltroArmazem && (
              <Chip
                label={`Armazém: ${appliedFiltroArmazem}`}
                onDelete={() => setAppliedFiltroArmazem('')}
                sx={{
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  fontWeight: 'bold',
                  borderRadius: 2,
                }}
              />
            )}
            {appliedFiltroStatus && (
              <Chip
                label={`Status: ${getStatusText(appliedFiltroStatus)}`}
                onDelete={() => setAppliedFiltroStatus('')}
                sx={{
                  backgroundColor: '#e8f5e8',
                  color: '#2e7d32',
                  fontWeight: 'bold',
                  borderRadius: 2,
                }}
              />
            )}
            <Button 
              variant="text" 
              onClick={handleLimparFiltro}
              sx={{ color: '#666', textTransform: 'none' }}
            >
              Limpar todos
            </Button>
          </Box>
        )}
      </Box>

      {/* Tabs de status */}
      <Tabs 
        value={aba} 
        onChange={(_, v) => setAba(v)} 
        sx={{ 
          mb: 3,
          '& .MuiTab-root': {
            borderRadius: 2,
            mx: 0.5,
            minHeight: 48,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.95rem'
          }
        }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab 
          label={`Todos (${stats.total})`} 
          value="todos" 
          sx={{ backgroundColor: '#f5f5f5' }}
        />
        <Tab 
          label={`Pendentes (${stats.pendentes})`} 
          value="pendente" 
          sx={{ backgroundColor: '#fff3e0' }}
        />
        <Tab 
          label={`Em Andamento (${stats.emAndamento})`} 
          value="em andamento" 
          sx={{ backgroundColor: '#e3f2fd' }}
        />
        <Tab 
          label={`Concluídas (${stats.concluidas})`} 
          value="concluida" 
          sx={{ backgroundColor: '#e8f5e8' }}
        />
        <Tab 
          label={`Canceladas (${stats.canceladas})`} 
          value="cancelada" 
          sx={{ backgroundColor: '#ffebee' }}
        />
      </Tabs>

      {/* Conteúdo - Cards ou Tabela */}
      {viewMode === 'cards' ? (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 3 
        }}>
          {exibidos.map((item) => (
            <Box key={item.auditoria_id}>
              <Card sx={{ 
                height: '100%',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  {/* Header do card */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: '#1a237e' }}>
                        #{item.auditoria_id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.localizacao.nome}
                      </Typography>
                    </Box>
                    <Chip
                      icon={getStatusIcon(item.status)}
                      label={getStatusText(item.status)}
                      sx={{
                        backgroundColor: getStatusColor(item.status),
                        color: 'white',
                        fontWeight: 600,
                        borderRadius: 2,
                      }}
                      size="small"
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Informações do card */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Person sx={{ mr: 1, fontSize: 16, color: '#666' }} />
                      <Typography variant="body2" color="text.secondary">
                        {item.usuario.responsavel}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Warehouse sx={{ mr: 1, fontSize: 16, color: '#666' }} />
                      <Typography variant="body2" color="text.secondary">
                        {item.armazem?.nome || '-'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Inventory sx={{ mr: 1, fontSize: 16, color: '#666' }} />
                      <Typography variant="body2" color="text.secondary">
                        {item.qtdOcorrencias || 0} ocorrências
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Schedule sx={{ mr: 1, fontSize: 16, color: '#666' }} />
                      <Typography variant="body2" color="text.secondary">
                        {item.data_hora_inicio}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Progresso visual */}
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={
                        item.status === 'pendente' ? 25 :
                        item.status === 'em andamento' ? 60 :
                        item.status === 'concluida' ? 100 : 0
                      }
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#e0e0e0',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          background: `linear-gradient(90deg, ${getStatusColor(item.status)} 0%, ${getStatusColor(item.status)}80 100%)`
                        }
                      }}
                    />
                  </Box>
                </CardContent>

                {/* Ações do card */}
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                    {item.status === 'pendente' && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PlayArrow />}
                        onClick={() => onClickIniciar(item)}
                        sx={{
                          flex: 1,
                          borderRadius: 2,
                          backgroundColor: '#2196f3',
                          '&:hover': { backgroundColor: '#1976d2' }
                        }}
                      >
                        Iniciar
                      </Button>
                    )}
                    {item.status === 'em andamento' && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => onClickConferir(item)}
                        sx={{
                          flex: 1,
                          borderRadius: 2,
                          backgroundColor: '#4caf50',
                          '&:hover': { backgroundColor: '#388e3c' }
                        }}
                      >
                        Conferir
                      </Button>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => setModalCancelar({ open: true, auditoria: item })}
                      sx={{
                        color: '#f44336',
                        '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
                      }}
                    >
                      <Cancel />
                    </IconButton>
                  </Box>
                                 </CardActions>
               </Card>
             </Box>
           ))}
         </Box>
      ) : (
        // Visualização em tabela
        <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 700 }}>Localização</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Criador</TableCell>
                <TableCell align='center' sx={{ fontWeight: 700 }}>Início</TableCell>
                <TableCell align='center' sx={{ fontWeight: 700 }}>Término</TableCell>
                <TableCell align='center' sx={{ fontWeight: 700 }}>Ocorrências</TableCell>
                <TableCell align='center' sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell align='center' sx={{ fontWeight: 700 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exibidos.map((item) => (
                <TableRow key={item.auditoria_id} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {item.localizacao.nome}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.armazem?.nome || '-'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{item.usuario.responsavel}</TableCell>
                  <TableCell align='center'>{item.data_hora_inicio}</TableCell>
                  <TableCell align='center'>{item.data_hora_conclusao}</TableCell>
                  <TableCell align='center'>
                    <Badge badgeContent={item.qtdOcorrencias || 0} color="primary">
                      <Inventory sx={{ color: '#666' }} />
                    </Badge>
                  </TableCell>
                  <TableCell align='center'>
                    <Chip
                      icon={getStatusIcon(item.status)}
                      label={getStatusText(item.status)}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(item.status),
                        color: 'white',
                        fontWeight: 600,
                        borderRadius: 2,
                      }}
                    />
                  </TableCell>
                  <TableCell align='center'>
                    <Box display="flex" gap={1} justifyContent="center">
                      {item.status === 'pendente' && (
                        <Tooltip title="Iniciar conferência">
                          <IconButton
                            size="small"
                            onClick={() => onClickIniciar(item)}
                            sx={{
                              color: '#2196f3',
                              '&:hover': { backgroundColor: 'rgba(33, 150, 243, 0.1)' },
                            }}
                          >
                            <PlayArrow fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {item.status === 'em andamento' && (
                        <Tooltip title="Continuar conferência">
                          <IconButton
                            size="small"
                            onClick={() => onClickConferir(item)}
                            sx={{
                              color: '#4caf50',
                              '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' },
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Cancelar auditoria">
                        <IconButton
                          size="small"
                          onClick={() => setModalCancelar({ open: true, auditoria: item })}
                          sx={{
                            color: '#f44336',
                            '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' },
                          }}
                        >
                          <Cancel fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Speed Dial para ações rápidas */}
      <SpeedDial
        ariaLabel="Ações rápidas"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.action}
          />
        ))}
      </SpeedDial>

      {/* Modais */}
      {/* Modal de confirmação para iniciar auditoria */}
      <Dialog
        open={!!modalIniciar}
        onClose={() => setModalIniciar(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700, 
          textAlign: 'center', 
          pt: 4,
          backgroundColor: '#e3f2fd',
          color: '#1976d2'
        }}>
          <PlayArrow sx={{ fontSize: 40, mb: 1 }} />
          Iniciar Auditoria
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography fontSize={18} sx={{ mb: 2 }}>
            Deseja iniciar a auditoria de <b>{modalIniciar?.localizacao.nome}</b>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta ação irá alterar o status da auditoria para "Em Andamento"
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 4, px: 4 }}>
          <Button
            onClick={() => setModalIniciar(null)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 4 }}
          >
            Cancelar
          </Button>
          <BotaoComPermissao
            modulo="auditoria"
            acao="incluir"
            onClick={() => modalIniciar && handleIniciarConferencia(modalIniciar.auditoria_id)}
            mensagemSemPermissao="Você não tem permissão para iniciar auditorias"
            variant="contained"
            startIcon={<PlayArrow />}
            sx={{ 
              borderRadius: 2, 
              px: 4,
              backgroundColor: '#2196f3',
              '&:hover': { backgroundColor: '#1976d2' }
            }}
          >
            Confirmar
          </BotaoComPermissao>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmação para conferir auditoria */}
      <Dialog
        open={!!modalConferir}
        onClose={() => setModalConferir(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700, 
          textAlign: 'center', 
          pt: 4,
          backgroundColor: '#e8f5e8',
          color: '#2e7d32'
        }}>
          <Visibility sx={{ fontSize: 40, mb: 1 }} />
          Conferir Auditoria
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography fontSize={18} sx={{ mb: 2 }}>
            Deseja conferir esta auditoria de <b>{modalConferir?.localizacao.nome}</b>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Você será redirecionado para a página de conferência
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 4, px: 4 }}>
          <Button
            onClick={() => setModalConferir(null)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 4 }}
          >
            Cancelar
          </Button>
          <BotaoComPermissao
            modulo="auditoria"
            acao="incluir"
            onClick={() => {
              if (modalConferir) {
                setModalConferir(null);
                navigate(`/ConferenciaAudi/${modalConferir.auditoria_id}`);
              }
            }}
            mensagemSemPermissao="Você não tem permissão para conferir auditorias"
            variant="contained"
            startIcon={<Visibility />}
            sx={{ 
              borderRadius: 2, 
              px: 4,
              backgroundColor: '#4caf50',
              '&:hover': { backgroundColor: '#388e3c' }
            }}
          >
            Conferir
          </BotaoComPermissao>
        </DialogActions>
      </Dialog>

      {/* Modal de cancelamento */}
      <Dialog
        open={modalCancelar.open}
        onClose={() => setModalCancelar({ open: false })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            border: '2px solid #f44336'
          }
        }}
      >
        <Box sx={{ backgroundColor: '#f44336', px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>
            Cancelar Auditoria
          </Typography>
          <IconButton onClick={() => setModalCancelar({ open: false })} size="small">
            <Close sx={{ color: '#fff' }} />
          </IconButton>
        </Box>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Cancel sx={{ fontSize: 60, color: '#f44336', mb: 2 }} />
          <Typography sx={{ fontSize: 18, fontWeight: 500, color: '#333', mb: 2 }}>
            Tem certeza que deseja <b>cancelar</b> a auditoria?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <b>{modalCancelar.auditoria?.localizacao.nome} - {modalCancelar.auditoria?.armazem?.nome}</b>
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Esta ação não pode ser desfeita!
          </Alert>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 4, px: 4 }}>
          <Button
            onClick={() => setModalCancelar({ open: false })}
            variant="outlined"
            sx={{ borderRadius: 2, px: 4 }}
          >
            Não, Voltar
          </Button>
          <Button
            onClick={() => modalCancelar.auditoria && handleCancelar(modalCancelar.auditoria.auditoria_id)}
            variant="contained"
            startIcon={<Cancel />}
            sx={{ 
              borderRadius: 2, 
              px: 4,
              backgroundColor: '#f44336',
              '&:hover': { backgroundColor: '#d32f2f' }
            }}
          >
            Sim, Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu de filtros */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <Box sx={{ p: 3, width: 300 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Filtros Avançados
          </Typography>
          <TextField
            select
            fullWidth
            label="Status"
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pendente">Pendente</MenuItem>
            <MenuItem value="em andamento">Em Andamento</MenuItem>
            <MenuItem value="concluida">Concluída</MenuItem>
            <MenuItem value="cancelada">Cancelada</MenuItem>
          </TextField>

          <TextField
            select
            fullWidth
            label="Armazém"
            value={filtroArmazem}
            onChange={(e) => setFiltroArmazem(e.target.value)}
            sx={{ mb: 3 }}
          >
            <MenuItem value="">Todos</MenuItem>
            {Array.from(new Set(auditorias.map((a) => a.armazem?.nome).filter(Boolean))).sort().map((a) => (
              <MenuItem key={a} value={a}>{a}</MenuItem>
            ))}
          </TextField>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="outlined" 
              onClick={handleAplicarFiltro}
              fullWidth
              sx={{ borderRadius: 2 }}
            >
              Aplicar
            </Button>
            <Button 
              variant="text" 
              onClick={handleLimparFiltro}
              sx={{ borderRadius: 2 }}
            >
              Limpar
            </Button>
          </Box>
        </Box>
      </Menu>

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
}