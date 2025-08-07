import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
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
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Layout from '../components/Layout';

// Dados simulados para demonstração
const mockData = {
  armazens: [
    { id: 1, nome: 'DIB', cidade: 'São Paulo', estado: 'SP' },
    { id: 2, nome: 'Sacotem', cidade: 'Campinas', estado: 'SP' },
    { id: 3, nome: 'Etic', cidade: 'Rio de Janeiro', estado: 'RJ' },
    { id: 4, nome: 'CenterSport', cidade: 'Belo Horizonte', estado: 'MG' },
  ],
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
  movimentacoesPorDia: [
    { dia: 'Seg', entrada: 45, saida: 32, transferencia: 18 },
    { dia: 'Ter', entrada: 52, saida: 38, transferencia: 22 },
    { dia: 'Qua', entrada: 38, saida: 41, transferencia: 15 },
    { dia: 'Qui', entrada: 61, saida: 35, transferencia: 28 },
    { dia: 'Sex', entrada: 48, saida: 44, transferencia: 20 },
    { dia: 'Sáb', entrada: 25, saida: 18, transferencia: 12 },
    { dia: 'Dom', entrada: 15, saida: 8, transferencia: 5 },
  ],
  estoquePorArmazem: [
    { armazem: 'DIB', quantidade: 5200, capacidade: 8000, percentual: 65 },
    { armazem: 'Sacotem', quantidade: 3800, capacidade: 6000, percentual: 63 },
    { armazem: 'Etic', quantidade: 2900, capacidade: 5000, percentual: 58 },
    { armazem: 'CenterSport', quantidade: 2950, capacidade: 4000, percentual: 74 },
  ],
  auditoriasPorStatus: [
    { status: 'Concluída', quantidade: 45, cor: '#4caf50' },
    { status: 'Em Andamento', quantidade: 12, cor: '#ff9800' },
    { status: 'Pendente', quantidade: 8, cor: '#f44336' },
    { status: 'Cancelada', quantidade: 3, cor: '#9e9e9e' },
  ],
  topProdutos: [
    { nome: 'Tênis Nike Air Max', quantidade: 1250, localizacao: 'DIB-A1-B2-C3', armazem: 'DIB' },
    { nome: 'Camisa Adidas Training', quantidade: 980, localizacao: 'Sacotem-A2-B1-C4', armazem: 'Sacotem' },
    { nome: 'Bola de Futebol Penalty', quantidade: 750, localizacao: 'Etic-A3-B3-C1', armazem: 'Etic' },
    { nome: 'Raquete Wilson Tennis', quantidade: 620, localizacao: 'CenterSport-A1-B4-C2', armazem: 'CenterSport' },
    { nome: 'Luvas de Boxe Everlast', quantidade: 450, localizacao: 'DIB-A2-B2-C5', armazem: 'DIB' },
  ],
  movimentacoesRecentes: [
    { tipo: 'Entrada', produto: 'Tênis Nike Air Max', quantidade: 500, hora: '14:30', armazem: 'DIB' },
    { tipo: 'Saída', produto: 'Camisa Adidas Training', quantidade: 200, hora: '14:25', armazem: 'Sacotem' },
    { tipo: 'Transferência', produto: 'Bola de Futebol Penalty', quantidade: 150, hora: '14:20', armazem: 'Etic' },
    { tipo: 'Entrada', produto: 'Raquete Wilson Tennis', quantidade: 300, hora: '14:15', armazem: 'CenterSport' },
    { tipo: 'Saída', produto: 'Luvas de Boxe Everlast', quantidade: 100, hora: '14:10', armazem: 'DIB' },
  ],
  alertas: [
    { tipo: 'warning', mensagem: 'Produto "Tênis Nike Air Max" com estoque baixo (5 unidades) - DIB' },
    { tipo: 'error', mensagem: 'Localização "DIB-A1-B2-C3" com ocupação 95%' },
    { tipo: 'info', mensagem: 'Auditoria programada para amanhã às 08:00 - Sacotem' },
    { tipo: 'success', mensagem: 'Separação #1234 concluída com sucesso - Etic' },
  ],
  performance: {
    taxaAcerto: 98.5,
    tempoMedioSeparacao: 2.3,
    usuariosAtivos: 12,
    ocupacaoArmazem: 85,
  },
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Dashboard() {
  const [data, setData] = useState(mockData);
  const [loading, setLoading] = useState(false);
  const [armazemFiltro, setArmazemFiltro] = useState('todos');

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

  const dadosFiltrados = armazemFiltro === 'todos' 
    ? data 
    : {
        ...data,
        topProdutos: data.topProdutos.filter(p => p.armazem === armazemFiltro),
        movimentacoesRecentes: data.movimentacoesRecentes.filter(m => m.armazem === armazemFiltro),
        alertas: data.alertas.filter(a => a.mensagem.includes(armazemFiltro)),
      };

  return (
    <Layout title="Dashboard">
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
          <Box display="flex" gap={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filtrar por Armazém</InputLabel>
              <Select
                value={armazemFiltro}
                label="Filtrar por Armazém"
                onChange={(e) => setArmazemFiltro(e.target.value)}
              >
                <MenuItem value="todos">Todos os Armazéns</MenuItem>
                {data.armazens.map((armazem) => (
                  <MenuItem key={armazem.id} value={armazem.nome}>
                    {armazem.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Atualizar dados">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Cards de Estatísticas Principais */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    {dadosFiltrados.estatisticas.totalProdutos.toLocaleString()}
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
                    {dadosFiltrados.estatisticas.movimentacoesHoje}
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
                    {dadosFiltrados.estatisticas.separacoesPendentes}
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
                    {dadosFiltrados.estatisticas.auditoriasPendentes}
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

        {/* Gráficos */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3, mb: 4 }}>
          {/* Gráfico de Movimentações por Dia */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Movimentações por Dia da Semana
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.movimentacoesPorDia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="entrada" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="saida" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                  <Area type="monotone" dataKey="transferencia" stackId="1" stroke="#ffc658" fill="#ffc658" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Estoque por Armazém */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Estoque por Armazém
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.estoquePorArmazem}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="armazem" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="quantidade" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Gráficos de Status */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
          {/* Gráfico de Status das Auditorias */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Status das Auditorias
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.auditoriasPorStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, percent }) => `${status} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="quantidade"
                  >
                    {data.auditoriasPorStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Tendências */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Tendências do Período
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                {Object.entries(dadosFiltrados.tendencias).map(([key, value]) => (
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
        </Box>

        {/* Tabelas e Listas */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
          {/* Top Produtos */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Top 5 Produtos em Estoque
              </Typography>
              <List>
                {dadosFiltrados.topProdutos.slice(0, 5).map((produto, index) => (
                  <ListItem key={index} divider={index < dadosFiltrados.topProdutos.length - 1}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <StorageIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={produto.nome}
                      secondary={`${produto.armazem} - ${produto.localizacao}`}
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
                {dadosFiltrados.movimentacoesRecentes.slice(0, 5).map((mov, index) => (
                  <ListItem key={index} divider={index < dadosFiltrados.movimentacoesRecentes.length - 1}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getMovimentacaoColor(mov.tipo) }}>
                        <LocalShippingIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={mov.produto}
                      secondary={`${mov.tipo} - ${mov.armazem} - ${mov.hora}`}
                    />
                    <Chip 
                      label={`${mov.quantidade} un`}
                      color="primary"
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Alertas e Performance */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
          {/* Alertas */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Alertas e Notificações
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                {dadosFiltrados.alertas.map((alerta, index) => (
                  <Alert key={index} severity={alerta.tipo as any} sx={{ mb: 1 }}>
                    {alerta.mensagem}
                  </Alert>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Métricas de Performance */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Métricas de Performance
              </Typography>
              <Box display="flex" flexDirection="column" gap={3}>
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Taxa de Acerto</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {data.performance.taxaAcerto}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={data.performance.taxaAcerto} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Tempo Médio Separação</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {data.performance.tempoMedioSeparacao} min
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(data.performance.tempoMedioSeparacao / 5) * 100} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Usuários Ativos</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {data.performance.usuariosAtivos}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(data.performance.usuariosAtivos / 20) * 100} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
                
                <Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Ocupação Armazém</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {data.performance.ocupacaoArmazem}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={data.performance.ocupacaoArmazem} 
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Layout>
  );
} 