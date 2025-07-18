// pages/auditoria.tsx
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
import { Search, Cancel } from '@mui/icons-material';
import Layout from '../components/Layout';
import { buscarOcorrencias } from '../services/API';
import { useNavigate } from 'react-router-dom';

interface OcorrenciaItem {
  ocorrencias_id: number;
  produto_estoque_id: number;
  localizacao_id: number;
  localizacao: string;
  produto: string;
  sku: string;
  quantidade: string;
  ativo: boolean;
}

const ITEMS_PER_PAGE = 50;

export default function Auditoria() {
  const [busca, setBusca] = useState('');
  const [aba, setAba] = useState<'todos' | 'pendente' | 'concluido'>('todos');
  const [ocorrencias, setOcorrencias] = useState<OcorrenciaItem[]>([]);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    async function carregar() {
      try {
        const ativo = aba === 'todos' ? undefined : aba === 'pendente' ? true : false;
        const dados = await buscarOcorrencias(ativo);
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

  const handleConferir = (ocorrencia: OcorrenciaItem) => {
    navigate(`/ConferenciaAudi/${ocorrencia.ocorrencias_id}`);
  };

  return (
    <Layout totalPages={totalPaginas} currentPage={paginaAtual} onPageChange={setPaginaAtual}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight={600}>
          Auditoria
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
          onClick={() => console.log('Nova Auditoria')}
        >
          Nova Auditoria
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
                    setSelecionados(e.target.checked ? exibidos.map((a) => a.ocorrencias_id) : [])
                  }
                />
              </TableCell>
              <TableCell>Localização</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exibidos.map((item) => (
              <TableRow key={item.ocorrencias_id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selecionados.includes(item.ocorrencias_id)}
                    onChange={() => toggleSelecionado(item.ocorrencias_id)}
                  />
                </TableCell>
                <TableCell>{item.localizacao}</TableCell>
                <TableCell>{item.produto}</TableCell>
                <TableCell>
                  <Chip
                    label={item.ativo ? 'Pendente' : 'Concluído'}
                    size="small"
                    sx={{
                      backgroundColor: item.ativo ? '#FFEB3B' : '#4CAF50',
                      color: item.ativo ? '#000' : '#fff',
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => handleConferir(item)}>
                    Conferir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" mt={3} gap={2}>
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