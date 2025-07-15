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
} from '@mui/material';
import { Search, Add, CheckCircle, Cancel } from '@mui/icons-material';
import Layout from '../components/Layout';
import { buscarOcorrencias } from '../services/API';
import { Navigate, useNavigate } from 'react-router-dom';


interface OcorrenciaItem {
  id: number;
  localizacao: string;
  produto: string;
  sku: string;
  quantidade: string;
  status: 'pendente' | 'concluido';
}

const ITEMS_PER_PAGE = 50;

export default function Ocorrencias() {
  const [busca, setBusca] = useState('');
  const [aba, setAba] = useState<'todos' | 'pendente' | 'concluido'>('todos');
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaItem[]>([]);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const navigate = useNavigate();


  useEffect(() => {
    async function carregar() {
      try {
        const dados = await buscarOcorrencias(aba === 'todos' ? undefined : aba);
        setOcorrencias(dados);
        setSelecionados([]);
      } catch (err) {
        alert('Erro ao carregar ocorrências.');
      }
    }

    carregar();
  }, [aba]);

  const filtrado = useMemo(() => {
    const termo = busca.toLowerCase();
    return ocorrencias.filter(
      (a) =>
        a.produto.toLowerCase().includes(termo) ||
        a.localizacao.toLowerCase().includes(termo)
    );
  }, [ocorrencias, busca]);

  const totalPaginas = Math.ceil(filtrado.length / ITEMS_PER_PAGE) || 1;
  const exibidos = filtrado.slice((paginaAtual - 1) * ITEMS_PER_PAGE, paginaAtual * ITEMS_PER_PAGE);

  const toggleSelecionado = (id: number) => {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  return (
    <Layout totalPages={totalPaginas} currentPage={paginaAtual} onPageChange={setPaginaAtual}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight={600}>
          Ocorrencias
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
    onClick={() => navigate('/NovaOcorrencias')}
  >
    Nova Ocorrencias
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
              <TableCell>Localização</TableCell>
              <TableCell>Nome do Produto</TableCell>
              <TableCell align='center'>SKU</TableCell>
              <TableCell align='center'>Quantidade de Ocorrências</TableCell>
              <TableCell align='center'>Status</TableCell>
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
                  <Chip
                    label={!item.status ? 'Concluído' : 'Pendente'}
                    size="small"
                    sx={{
                      backgroundColor: !item.status ? '#4CAF50' : '#FFEB3B',
                      color: !item.status ? '#fff' : '#000',
                      fontWeight: 600,
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
