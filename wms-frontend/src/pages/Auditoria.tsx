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
import axios from 'axios';

interface Ocorrencia {
  ocorrencia_id: number;
  descricao: string;
  status: 'pendente' | 'concluído';
}

interface AuditoriaItem {
  auditoria_id: number;
  conclusao: string;
  data_hora_inicio: string;
  data_hora_fim: string;
  status: 'pendente' | 'concluido';
  usuario: {
    responsavel: string;
  };
  localizacao: {
    nome: string
  }
  ocorrencias: Ocorrencia[]
}

const ITEMS_PER_PAGE = 10;

export default function Auditoria() {
  const [busca, setBusca] = useState('');
  const [aba, setAba] = useState<'todos' | 'pendente' | 'concluido'>('todos');
  const [auditorias, setAuditorias] = useState<AuditoriaItem[]>([]);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await buscarAuditorias();
        // Mapear os dados para o formato esperado
        const auditoriasFormatadas = dados.map(aud => ({
          ...aud,
          data_hora_inicio: aud.data_hora_fim ? formatarData(aud.data_hora_inicio) : '-',
          data_hora_fim: aud.data_hora_fim ? formatarData(aud.data_hora_fim) : '-'
        }));
        setAuditorias(auditoriasFormatadas);
        setSelecionados([]);
      } catch (err) {
        alert('Erro ao carregar auditorias.');
      }
    }

    carregar();
  }, [aba]);

  function formatarData(dataString: string | Date) {
    const data = new Date(dataString);
    return data.toLocaleString('pt-BR');
  }

  const filtrado = useMemo(() => {
    const termo = busca.toLowerCase();
    return auditorias.filter(aud => {
      // Filtrar por status se não for 'todos'
      const statusMatch = aba === 'todos' || aud.status === aba;
      // Filtrar por termo de busca
      const buscaMatch = 
        aud.usuario.responsavel.toLowerCase().includes(termo) ||
        aud.auditoria_id.toString().includes(termo);
      
      return statusMatch && buscaMatch;
    });
  }, [auditorias, busca, aba]);

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

  return (
    <Layout totalPages={totalPaginas} currentPage={paginaAtual} onPageChange={setPaginaAtual}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight={600}>
          Auditorias
        </Typography>
      </Box>

      <Box display="flex" gap={2} alignItems="center" mb={2} flexWrap="wrap">
        <TextField
          placeholder="Busca por usuário ou ID"
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
                    setSelecionados(e.target.checked ? exibidos.map((a) => a.auditoria_id) : [])
                  }
                />
              </TableCell>
              <TableCell>Localização</TableCell>
              <TableCell>Criador</TableCell>
              <TableCell>Início</TableCell>
              <TableCell>Término</TableCell>
              <TableCell>Ocorrências</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {exibidos.map((item) => (
              <TableRow key={item.auditoria_id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selecionados.includes(item.auditoria_id)}
                    onChange={() => toggleSelecionado(item.auditoria_id)}
                  />
                </TableCell>
                <TableCell>{item.localizacao.nome}</TableCell>
                <TableCell>{item.usuario.responsavel}</TableCell>
                <TableCell>{item.data_hora_inicio}</TableCell>
                <TableCell>{item.data_hora_fim}</TableCell>
                <TableCell>modal de ocorrencias</TableCell>
                <TableCell>
                  <Chip
                    label={item.status === 'concluido' ? 'Concluído' : 'Pendente'}
                    size="small"
                    sx={{
                      backgroundColor: item.status === 'concluido' ? '#4CAF50' : '#FFEB3B',
                      color: item.status === 'concluido' ? '#fff' : '#000',
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

async function buscarAuditorias(): Promise<AuditoriaItem[]> {
  try {
    const res = await axios.get('http://151.243.0.78:3001/auditoria');
    return res.data;
  } catch (err) {
    console.error('Erro ao buscar auditorias →', err);
    throw new Error('Falha ao carregar as auditorias do servidor.');
  }
}