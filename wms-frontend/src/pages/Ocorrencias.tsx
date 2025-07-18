import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
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
  TableSortLabel
} from '@mui/material';
import { Search, Add, CheckCircle, Cancel } from '@mui/icons-material';
import Layout from '../components/Layout';
import { buscarOcorrencias } from '../services/API';
import { useNavigate } from 'react-router-dom';

interface OcorrenciaItem {
  id: number;
  localizacao: string;
  produto: string;
  sku: string;
  quantidade: number;
  ativo: boolean;
  prioridade?: 'baixa' | 'media' | 'alta'; // prioridade adicionada
}

const ITEMS_PER_PAGE = 50;

export default function Ocorrencias() {
  const [busca, setBusca] = useState('');
  const [aba, setAba] = useState<'todos' | 'pendente' | 'concluido'>('todos');
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaItem[]>([]);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [orderBy, setOrderBy] = useState<keyof OcorrenciaItem>('localizacao');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');
  const navigate = useNavigate();

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await buscarOcorrencias(
          aba === 'pendente' ? true : aba === 'concluido' ? false : undefined
        );

        const dadosComPrioridade = dados.map((item: OcorrenciaItem) => {
          let prioridade: OcorrenciaItem['prioridade'] = 'baixa';
          if (item.quantidade >= 5) prioridade = 'alta';
          else if (item.quantidade >= 3) prioridade = 'media';
          return { ...item, prioridade };
        });

        setOcorrencias(dadosComPrioridade);
        setSelecionados([]);
      } catch (err) {
        alert('Erro ao carregar ocorrências.');
      }
    }

    carregar();
  }, [aba]);

  const handleSort = (property: keyof OcorrenciaItem) => {
    const isAsc = orderBy === property && orderDirection === 'asc';
    setOrderBy(property);
    setOrderDirection(isAsc ? 'desc' : 'asc');
  };

  const filtrado = useMemo(() => {
    const termo = busca.toLowerCase();
    return ocorrencias
      .filter((a) =>
        a.produto.toLowerCase().includes(termo) ||
        a.localizacao.toLowerCase().includes(termo)
      )
      .filter((a) => {
        if (aba === 'pendente') return a.ativo === true;
        if (aba === 'concluido') return a.ativo === false;
        return true;
      });
  }, [ocorrencias, busca, aba]);

  const prioridadeValor = (p: OcorrenciaItem['prioridade']) => {
    if (p === 'alta') return 3;
    if (p === 'media') return 2;
    return 1;
  };

  const ordenado = useMemo(() => {
    return [...filtrado].sort((a, b) => {
      let aVal: any = a[orderBy];
      let bVal: any = b[orderBy];

      if (orderBy === 'prioridade') {
        aVal = prioridadeValor(a.prioridade);
        bVal = prioridadeValor(b.prioridade);
      }

      const aStr = typeof aVal === 'string' ? aVal.toLowerCase() : aVal;
      const bStr = typeof bVal === 'string' ? bVal.toLowerCase() : bVal;

      if (aStr < bStr) return orderDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return orderDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filtrado, orderBy, orderDirection]);

  const totalPaginas = Math.ceil(ordenado.length / ITEMS_PER_PAGE) || 1;
  const exibidos = ordenado.slice((paginaAtual - 1) * ITEMS_PER_PAGE, paginaAtual * ITEMS_PER_PAGE);

  const toggleSelecionado = (id: number) => {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  return (
    <Layout totalPages={totalPaginas} currentPage={paginaAtual} onPageChange={setPaginaAtual}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight={600}>
          Ocorrências
        </Typography>
      </Box>

      <Box display="flex" gap={2} alignItems="center" mb={2} flexWrap="wrap">
        <TextField
          placeholder="Busca por localização ou SKU"
          size="small"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: 400 }}
        />

        <Button variant="outlined">Filtro</Button>

        <Button
          variant="contained"
          sx={{ backgroundColor: '#61de27', color: '#000', fontWeight: 'bold' }}
          onClick={() => navigate('/NovaOcorrencia')}
        >
          Nova Ocorrência
        </Button>
      </Box>

      <Tabs value={aba} onChange={(_, v) => setAba(v)} sx={{ mb: 2 }}>
        <Tab label="Todos" value="todos" />
        <Tab label="Pendentes" value="pendente" />
        <Tab label="Concluídos" value="concluido" />
      </Tabs>

      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selecionados.length === exibidos.length && exibidos.length > 0}
                  indeterminate={selecionados.length > 0 && selecionados.length < exibidos.length}
                  onChange={(e) =>
                    setSelecionados(e.target.checked ? exibidos.map((a) => a.id) : [])
                  }
                />
              </TableCell>
              <TableCell sortDirection={orderBy === 'localizacao' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'localizacao'}
                  direction={orderBy === 'localizacao' ? orderDirection : 'asc'}
                  onClick={() => handleSort('localizacao')}
                >
                  Localização
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'produto' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'produto'}
                  direction={orderBy === 'produto' ? orderDirection : 'asc'}
                  onClick={() => handleSort('produto')}
                >
                  Nome do Produto
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'sku' ? orderDirection : false} align="center">
                <TableSortLabel
                  active={orderBy === 'sku'}
                  direction={orderBy === 'sku' ? orderDirection : 'asc'}
                  onClick={() => handleSort('sku')}
                >
                  SKU
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'quantidade' ? orderDirection : false} align="center">
                <TableSortLabel
                  active={orderBy === 'quantidade'}
                  direction={orderBy === 'quantidade' ? orderDirection : 'asc'}
                  onClick={() => handleSort('quantidade')}
                >
                  Quantidade de Ocorrências
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'prioridade' ? orderDirection : false} align="center">
                <TableSortLabel
                  active={orderBy === 'prioridade'}
                  direction={orderDirection}
                  onClick={() => handleSort('prioridade')}
                >
                  Prioridade
                </TableSortLabel>
              </TableCell>
              <TableCell sortDirection={orderBy === 'ativo' ? orderDirection : false} align="center">
                <TableSortLabel
                  active={orderBy === 'ativo'}
                  direction={orderBy === 'ativo' ? orderDirection : 'asc'}
                  onClick={() => handleSort('ativo')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exibidos.map((item) => (
              <TableRow key={item.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selecionados.includes(item.id)}
                    onChange={() => toggleSelecionado(item.id)}
                  />
                </TableCell>
                <TableCell>{item.localizacao}</TableCell>
                <TableCell>{item.produto}</TableCell>
                <TableCell align='center'>{item.sku}</TableCell>
                <TableCell align='center'>{item.quantidade}</TableCell>

                <TableCell align='center'>
                  {item.prioridade === 'baixa' && (
                    <Chip label="Baixa" sx={{ backgroundColor: '#4CAF50', color: '#fff', fontWeight: 600, px: 2 }} />
                  )}
                  {item.prioridade === 'media' && (
                    <Chip label="Média" sx={{ backgroundColor: '#FF9800', color: '#000', fontWeight: 600, px: 2 }} />
                  )}
                  {item.prioridade === 'alta' && (
                    <Chip label="Alta" sx={{ backgroundColor: '#F44336', color: '#fff', fontWeight: 600, px: 2 }} />

                  )}
                </TableCell>
                <TableCell align='center'>
                  <Chip
                    label={!item.ativo ? 'Concluído' : 'Pendente'}
                    size="small"
                    sx={{
                      backgroundColor: !item.ativo ? '#61de27' : '#FFEB3B',
                      color: !item.ativo ? '#fff' : '#000',
                      fontWeight: 600,
                      px: 2
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" mt={3} gap={2}>
        <Button
          variant="contained"
          color="success"
          startIcon={<CheckCircle />}
          disabled={selecionados.length === 0}
        >
          Conferir Selecionado
        </Button>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Cancel />}
          onClick={() => setSelecionados([])}
        >
          Cancelar
        </Button>
      </Box>
    </Layout>
  );
}
