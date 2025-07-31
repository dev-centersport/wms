import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  Assignment as AssignmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  People as PeopleIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';

// Dados simulados para demonstração
const mockData = {
  estatisticas: {
    totalProdutos: 15420,
    produtosEmEstoque: 12850,
    produtosBaixoEstoque: 1250,
    produtosSemEstoque: 320,
    movimentacoesHoje: 245,
    separacoesPendentes: 18,
    auditoriasPendentes: 5,
    ocorrenciasAbertas: 12,
  },
  tendencias: {
    vendas: { valor: 15.2, direcao: 'up' },
    estoque: { valor: 8.7, direcao: 'up' },
    movimentacoes: { valor: 12.1, direcao: 'up' },
    ocorrencias: { valor: 3.2, direcao: 'down' },
  },
  topProdutos: [
    { nome: 'Produto A', quantidade: 1250, localizacao: 'A1-B2-C3' },
    { nome: 'Produto B', quantidade: 980, localizacao: 'A2-B1-C4' },
    { nome: 'Produto C', quantidade: 750, localizacao: 'A3-B3-C1' },
    { nome: 'Produto D', quantidade: 620, localizacao: 'A1-B4-C2' },
    { nome: 'Produto E', quantidade: 450, localizacao: 'A2-B2-C5' },
  ],
  movimentacoesRecentes: [
    { tipo: 'Entrada', produto: 'Produto X', quantidade: 500, hora: '14:30' },
    { tipo: 'Saída', produto: 'Produto Y', quantidade: 200, hora: '14:25' },
    { tipo: 'Transferência', produto: 'Produto Z', quantidade: 150, hora: '14:20' },
    { tipo: 'Entrada', produto: 'Produto W', quantidade: 300, hora: '14:15' },
    { tipo: 'Saída', produto: 'Produto V', quantidade: 100, hora: '14:10' },
  ],
  alertas: [
    { tipo: 'warning', mensagem: 'Produto "ABC123" com estoque baixo (5 unidades)' },
    { tipo: 'error', mensagem: 'Localização "A1-B2-C3" com ocupação 95%' },
    { tipo: 'info', mensagem: 'Auditoria programada para amanhã às 08:00' },
    { tipo: 'success', mensagem: 'Separação #1234 concluída com sucesso' },
  ],
};

export default function Dashboard() {
  const [data, setData] = useState(mockData);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
  };

  const getTendenciaIcon = (direcao: string) => {
    return direcao === 'up' ? <TrendingUpIcon color="success" /> : <TrendingDownIcon color="error" />;
  };

  const getTendenciaColor = (direcao: string) => {
    return direcao === 'up' ? 'success.main' : 'error.main';
  };

  const getMovimentacaoColor = (tipo: string) => {
    switch (tipo) {
      case 'Entrada': return 'success.main';
      case 'Saída': return 'error.main';
      case 'Transferência': return 'warning.main';
      default: return 'info.main';
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
              <AnalyticsIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={600} color="primary">
                Dashboard WMS
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Visão geral do sistema de gerenciamento de armazém
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Atualizar dados">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Notificações">
              <IconButton>
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Cards de Estatísticas Principais */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 3, mb: 4 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {data.estatisticas.totalProdutos.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total de Produtos
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <InventoryIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {data.estatisticas.movimentacoesHoje}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Movimentações Hoje
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <LocalShippingIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {data.estatisticas.separacoesPendentes}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Separações Pendentes
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <AssignmentIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {data.estatisticas.auditoriasPendentes}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Auditorias Pendentes
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <CheckCircleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Gráficos e Métricas */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3, mb: 4 }}>
          {/* Tendências */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Tendências do Período
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                {Object.entries(data.tendencias).map(([key, value]) => (
                  <Box key={key} display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1}>
                      {getTendenciaIcon(value.direcao)}
                      <Typography variant="body2" textTransform="capitalize">
                        {key}
                      </Typography>
                    </Box>
                    <Typography variant="h6" color={getTendenciaColor(value.direcao)} fontWeight={600}>
                      {value.valor}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Status do Estoque */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Status do Estoque
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Em Estoque</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {data.estatisticas.produtosEmEstoque.toLocaleString()}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={83} 
                    sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.200' }}
                  />
                </Box>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Baixo Estoque</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {data.estatisticas.produtosBaixoEstoque.toLocaleString()}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={8} 
                    color="warning"
                    sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.200' }}
                  />
                </Box>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Sem Estoque</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {data.estatisticas.produtosSemEstoque.toLocaleString()}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={2} 
                    color="error"
                    sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.200' }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Tabelas e Listas */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 3, mb: 4 }}>
          {/* Top Produtos */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Top 5 Produtos em Estoque
              </Typography>
              <List>
                {data.topProdutos.map((produto, index) => (
                  <ListItem key={index} divider={index < data.topProdutos.length - 1}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <StorageIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={produto.nome}
                      secondary={`Localização: ${produto.localizacao}`}
                    />
                    <Chip 
                      label={`${produto.quantidade.toLocaleString()} un`}
                      color="primary"
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Movimentações Recentes */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Movimentações Recentes
              </Typography>
              <List>
                {data.movimentacoesRecentes.map((mov, index) => (
                  <ListItem key={index} divider={index < data.movimentacoesRecentes.length - 1}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getMovimentacaoColor(mov.tipo) }}>
                        <LocalShippingIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={mov.produto}
                      secondary={`${mov.tipo} - ${mov.quantidade} unidades`}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {mov.hora}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Alertas e Notificações */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={3}>
              Alertas e Notificações
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {data.alertas.map((alerta, index) => (
                <Alert 
                  key={index}
                  severity={alerta.tipo as any}
                  icon={
                    alerta.tipo === 'warning' ? <WarningIcon /> :
                    alerta.tipo === 'error' ? <WarningIcon /> :
                    alerta.tipo === 'success' ? <CheckCircleIcon /> :
                    <ScheduleIcon />
                  }
                >
                  {alerta.mensagem}
                </Alert>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Métricas de Performance */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3, mt: 4 }}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <SpeedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700} color="primary">
              98.5%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Taxa de Acerto
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <ScheduleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700} color="success.main">
              2.3 min
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tempo Médio Separação
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <PeopleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700} color="warning.main">
              12
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Usuários Ativos
            </Typography>
          </Paper>

          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <StorageIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700} color="info.main">
              85%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ocupação do Armazém
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Layout>
  );
} 