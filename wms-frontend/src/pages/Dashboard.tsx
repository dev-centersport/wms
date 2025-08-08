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
  // Novos dados para gráficos adicionais
  vendasPorMes: [
    { mes: 'Jan', vendas: 4200, meta: 5000 },
    { mes: 'Fev', vendas: 3800, meta: 5000 },
    { mes: 'Mar', vendas: 5200, meta: 5000 },
    { mes: 'Abr', vendas: 4800, meta: 5000 },
    { mes: 'Mai', vendas: 6100, meta: 5000 },
    { mes: 'Jun', vendas: 5500, meta: 5000 },
    { mes: 'Jul', vendas: 7200, meta: 5000 },
    { mes: 'Ago', vendas: 6800, meta: 5000 },
    { mes: 'Set', vendas: 5900, meta: 5000 },
    { mes: 'Out', vendas: 6300, meta: 5000 },
    { mes: 'Nov', vendas: 7100, meta: 5000 },
    { mes: 'Dez', vendas: 7800, meta: 5000 },
  ],
  categoriasProdutos: [
    { categoria: 'Tênis', quantidade: 3200, cor: '#FF6B6B' },
    { categoria: 'Camisetas', quantidade: 2800, cor: '#4ECDC4' },
    { categoria: 'Bolas', quantidade: 1500, cor: '#45B7D1' },
    { categoria: 'Acessórios', quantidade: 2200, cor: '#96CEB4' },
    { categoria: 'Equipamentos', quantidade: 1800, cor: '#FFEAA7' },
    { categoria: 'Roupas', quantidade: 2400, cor: '#DDA0DD' },
  ],
  eficienciaPorHora: [
    { hora: '08:00', separacoes: 45, movimentacoes: 32, auditorias: 8 },
    { hora: '09:00', separacoes: 52, movimentacoes: 38, auditorias: 12 },
    { hora: '10:00', separacoes: 61, movimentacoes: 45, auditorias: 15 },
    { hora: '11:00', separacoes: 58, movimentacoes: 42, auditorias: 10 },
    { hora: '12:00', separacoes: 35, movimentacoes: 28, auditorias: 5 },
    { hora: '13:00', separacoes: 48, movimentacoes: 35, auditorias: 8 },
    { hora: '14:00', separacoes: 67, movimentacoes: 52, auditorias: 18 },
    { hora: '15:00', separacoes: 72, movimentacoes: 58, auditorias: 22 },
    { hora: '16:00', separacoes: 55, movimentacoes: 41, auditorias: 12 },
    { hora: '17:00', separacoes: 38, movimentacoes: 25, auditorias: 8 },
  ],
  ocupacaoLocalizacoes: [
    { localizacao: 'DIB-A1', ocupacao: 85, capacidade: 100 },
    { localizacao: 'DIB-A2', ocupacao: 92, capacidade: 100 },
    { localizacao: 'Sacotem-B1', ocupacao: 78, capacidade: 100 },
    { localizacao: 'Sacotem-B2', ocupacao: 65, capacidade: 100 },
    { localizacao: 'Etic-C1', ocupacao: 88, capacidade: 100 },
    { localizacao: 'Etic-C2', ocupacao: 95, capacidade: 100 },
    { localizacao: 'CenterSport-D1', ocupacao: 72, capacidade: 100 },
    { localizacao: 'CenterSport-D2', ocupacao: 81, capacidade: 100 },
  ],
  metricasQualidade: [
    { metrica: 'Precisão', valor: 98.5, meta: 95 },
    { metrica: 'Velocidade', valor: 92.3, meta: 90 },
    { metrica: 'Eficiência', valor: 89.7, meta: 85 },
    { metrica: 'Satisfação', valor: 96.8, meta: 90 },
    { metrica: 'Confiabilidade', valor: 94.2, meta: 92 },
  ],
  temperaturaUmidade: [
    { hora: '00:00', temperatura: 22, umidade: 65 },
    { hora: '04:00', temperatura: 21, umidade: 68 },
    { hora: '08:00', temperatura: 23, umidade: 62 },
    { hora: '12:00', temperatura: 26, umidade: 58 },
    { hora: '16:00', temperatura: 25, umidade: 60 },
    { hora: '20:00', temperatura: 24, umidade: 63 },
  ],
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

        {/* Gráficos Principais */}
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

        {/* Novos Gráficos - Vendas e Categorias */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 4 }}>
          {/* Gráfico de Vendas por Mês */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Vendas vs Meta Anual
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.vendasPorMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="vendas" stroke="#8884d8" strokeWidth={3} />
                  <Line type="monotone" dataKey="meta" stroke="#ff7300" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Categorias de Produtos */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Produtos por Categoria
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.categoriasProdutos} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="categoria" type="category" width={80} />
                  <RechartsTooltip />
                  <Bar dataKey="quantidade" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Gráficos de Eficiência e Ocupação */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 4 }}>
          {/* Gráfico de Eficiência por Hora */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Eficiência Operacional por Hora
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                  {/* Linha de Separações */}
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    height: '60%', 
                    background: 'linear-gradient(180deg, rgba(136, 132, 216, 0.1) 0%, rgba(136, 132, 216, 0.3) 100%)',
                    borderTop: '2px solid #8884d8'
                  }} />
                  
                  {/* Linha de Movimentações */}
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    height: '45%', 
                    background: 'linear-gradient(180deg, rgba(130, 202, 157, 0.1) 0%, rgba(130, 202, 157, 0.3) 100%)',
                    borderTop: '2px solid #82ca9d'
                  }} />
                  
                  {/* Linha de Auditorias */}
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    height: '25%', 
                    background: 'linear-gradient(180deg, rgba(255, 198, 88, 0.1) 0%, rgba(255, 198, 88, 0.3) 100%)',
                    borderTop: '2px solid #ffc658'
                  }} />
                  
                  {/* Pontos de dados */}
                  {data.eficienciaPorHora.map((item, index) => (
                    <Box key={index} sx={{ 
                      position: 'absolute', 
                      left: `${(index / (data.eficienciaPorHora.length - 1)) * 100}%`,
                      bottom: `${(item.separacoes / 80) * 100}%`,
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: '#8884d8',
                      transform: 'translateX(-50%)'
                    }} />
                  ))}
                  
                  {/* Legendas */}
                  <Box sx={{ position: 'absolute', top: 10, right: 10, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, backgroundColor: '#8884d8', borderRadius: '50%' }} />
                      <Typography variant="caption">Separações</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, backgroundColor: '#82ca9d', borderRadius: '50%' }} />
                      <Typography variant="caption">Movimentações</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, backgroundColor: '#ffc658', borderRadius: '50%' }} />
                      <Typography variant="caption">Auditorias</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Gráfico de Ocupação de Localizações */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Ocupação de Localizações (%)
              </Typography>
              <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', p: 2 }}>
                {data.ocupacaoLocalizacoes.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 80, fontSize: '0.75rem' }}>
                      {item.localizacao}
                    </Typography>
                    <Box sx={{ 
                      flex: 1, 
                      height: 20, 
                      backgroundColor: '#f0f0f0', 
                      borderRadius: 10,
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <Box sx={{ 
                        width: `${item.ocupacao}%`, 
                        height: '100%', 
                        backgroundColor: item.ocupacao > 90 ? '#f44336' : item.ocupacao > 75 ? '#ff9800' : '#4caf50',
                        borderRadius: 10,
                        transition: 'width 0.3s ease'
                      }} />
                    </Box>
                    <Typography variant="body2" sx={{ minWidth: 40, fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {item.ocupacao}%
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Gráficos de Qualidade e Ambiente */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 4 }}>
          {/* Gráfico de Métricas de Qualidade */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Métricas de Qualidade vs Meta
              </Typography>
              <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', p: 2 }}>
                {data.metricasQualidade.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 100, fontSize: '0.8rem' }}>
                      {item.metrica}
                    </Typography>
                    <Box sx={{ 
                      flex: 1, 
                      height: 25, 
                      backgroundColor: '#f0f0f0', 
                      borderRadius: 12,
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {/* Barra de valor atual */}
                      <Box sx={{ 
                        width: `${(item.valor / 100) * 100}%`, 
                        height: '100%', 
                        backgroundColor: item.valor >= item.meta ? '#4caf50' : '#ff9800',
                        borderRadius: 12,
                        transition: 'width 0.3s ease'
                      }} />
                      {/* Linha da meta */}
                      <Box sx={{ 
                        position: 'absolute',
                        left: `${(item.meta / 100) * 100}%`,
                        top: 0,
                        bottom: 0,
                        width: 2,
                        backgroundColor: '#f44336',
                        zIndex: 2
                      }} />
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {item.valor}%
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                        Meta: {item.meta}%
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Gráfico de Temperatura e Umidade */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Monitoramento Ambiental
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                  {/* Linha de Temperatura */}
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    height: '70%', 
                    background: 'linear-gradient(180deg, rgba(255, 115, 0, 0.1) 0%, rgba(255, 115, 0, 0.3) 100%)',
                    borderTop: '2px solid #ff7300'
                  }} />
                  
                  {/* Linha de Umidade */}
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    height: '65%', 
                    background: 'linear-gradient(180deg, rgba(130, 202, 157, 0.1) 0%, rgba(130, 202, 157, 0.3) 100%)',
                    borderTop: '2px solid #82ca9d'
                  }} />
                  
                  {/* Pontos de temperatura */}
                  {data.temperaturaUmidade.map((item, index) => (
                    <Box key={`temp-${index}`} sx={{ 
                      position: 'absolute', 
                      left: `${(index / (data.temperaturaUmidade.length - 1)) * 100}%`,
                      bottom: `${(item.temperatura / 30) * 100}%`,
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: '#ff7300',
                      transform: 'translateX(-50%)'
                    }} />
                  ))}
                  
                  {/* Pontos de umidade */}
                  {data.temperaturaUmidade.map((item, index) => (
                    <Box key={`umid-${index}`} sx={{ 
                      position: 'absolute', 
                      left: `${(index / (data.temperaturaUmidade.length - 1)) * 100}%`,
                      bottom: `${(item.umidade / 100) * 100}%`,
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: '#82ca9d',
                      transform: 'translateX(-50%)'
                    }} />
                  ))}
                  
                  {/* Legendas */}
                  <Box sx={{ position: 'absolute', top: 10, right: 10, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, backgroundColor: '#ff7300', borderRadius: '50%' }} />
                      <Typography variant="caption">Temperatura (°C)</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, backgroundColor: '#82ca9d', borderRadius: '50%' }} />
                      <Typography variant="caption">Umidade (%)</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Gráficos de Status e Tendências */}
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

        {/* Gráficos Especiais - Performance e Produtividade */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, mb: 4 }}>
          {/* Gráfico de Performance por Categoria */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Performance por Categoria
              </Typography>
              <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', p: 2 }}>
                {data.categoriasProdutos.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" sx={{ minWidth: 100, fontSize: '0.8rem' }}>
                      {item.categoria}
                    </Typography>
                    <Box sx={{ 
                      flex: 1, 
                      height: 20, 
                      backgroundColor: '#f0f0f0', 
                      borderRadius: 10,
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      <Box sx={{ 
                        width: `${(item.quantidade / 3500) * 100}%`, 
                        height: '100%', 
                        backgroundColor: item.cor,
                        borderRadius: 10,
                        transition: 'width 0.3s ease'
                      }} />
                    </Box>
                    <Typography variant="body2" sx={{ minWidth: 60, fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {item.quantidade.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Gráfico de Produtividade Diária */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>
                Produtividade Diária
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                  {/* Área de entrada com gradiente */}
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    height: '60%', 
                    background: 'linear-gradient(180deg, rgba(136, 132, 216, 0.2) 0%, rgba(136, 132, 216, 0.6) 100%)',
                    borderTop: '2px solid #8884d8'
                  }} />
                  
                  {/* Área de saída com gradiente */}
                  <Box sx={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    left: 0, 
                    right: 0, 
                    height: '40%', 
                    background: 'linear-gradient(180deg, rgba(130, 202, 157, 0.2) 0%, rgba(130, 202, 157, 0.6) 100%)',
                    borderTop: '2px solid #82ca9d'
                  }} />
                  
                  {/* Pontos de entrada */}
                  {data.movimentacoesPorDia.map((item, index) => (
                    <Box key={`entrada-${index}`} sx={{ 
                      position: 'absolute', 
                      left: `${(index / (data.movimentacoesPorDia.length - 1)) * 100}%`,
                      bottom: `${(item.entrada / 70) * 100}%`,
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%', 
                      backgroundColor: '#8884d8',
                      transform: 'translateX(-50%)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  ))}
                  
                  {/* Pontos de saída */}
                  {data.movimentacoesPorDia.map((item, index) => (
                    <Box key={`saida-${index}`} sx={{ 
                      position: 'absolute', 
                      left: `${(index / (data.movimentacoesPorDia.length - 1)) * 100}%`,
                      bottom: `${(item.saida / 70) * 100}%`,
                      width: 10, 
                      height: 10, 
                      borderRadius: '50%', 
                      backgroundColor: '#82ca9d',
                      transform: 'translateX(-50%)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  ))}
                  
                  {/* Legendas */}
                  <Box sx={{ position: 'absolute', top: 10, right: 10, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, backgroundColor: '#8884d8', borderRadius: '50%' }} />
                      <Typography variant="caption">Entrada</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, backgroundColor: '#82ca9d', borderRadius: '50%' }} />
                      <Typography variant="caption">Saída</Typography>
                    </Box>
                  </Box>
                </Box>
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