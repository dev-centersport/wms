// src/pages/TipoLocalizacao.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Button, Checkbox, IconButton, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { buscarTiposDeLocalizacao, excluirTipoLocalizacao } from '../services/API';
import Layout from '../components/Layout';

interface TipoLocalizacao {
  tipo_localizacao_id: number;
  tipo: string;
}

const TipoLocalizacaoPage: React.FC = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [tipos, setTipos] = useState<TipoLocalizacao[]>([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const porPagina = 50;

  useEffect(() => {
    const carregar = async () => {
      try {
        const lista = await buscarTiposDeLocalizacao();
        setTipos(lista);
      } catch (err: any) {
        alert(err.message ?? 'Erro ao buscar tipos de localização.');
      }
    };
    carregar();
  }, []);

  const tiposFiltrados = useMemo(() => {
    const termo = busca.toLowerCase();
    return tipos.filter(t => t.tipo.toLowerCase().includes(termo));
  }, [tipos, busca]);

  const tiposPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * porPagina;
    return tiposFiltrados.slice(inicio, inicio + porPagina);
  }, [tiposFiltrados, paginaAtual]);

  const totalPaginas = Math.max(1, Math.ceil(tiposFiltrados.length / porPagina));

  const handleExcluir = async (id: number) => {
    const confirmar = window.confirm('Deseja realmente excluir?');
    if (!confirmar) return;

    try {
      await excluirTipoLocalizacao(id);
      setTipos(prev => prev.filter(t => t.tipo_localizacao_id !== id));
      alert('Excluído com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir.');
    }
  };

  return (
    <Layout currentPage={paginaAtual} totalPages={totalPaginas} onPageChange={setPaginaAtual}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Tipo de Localização
      </Typography>

      <Box display="flex" gap={2} mb={3} alignItems="center" flexWrap="wrap">
        <TextField
          placeholder="Busca"
          variant='outlined'
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          size="small"
          sx={{ maxWidth: 480, width: 380 }}
        />
        <Button
          variant="contained"
          onClick={() => navigate('/CriarTipoLocalizacao')}
          startIcon={<AddIcon />}
          sx={{ backgroundColor: '#59e60d', color: '#000', fontWeight: 'bold' }}
        >
          Novo Tipo Localização
        </Button>
      </Box>

      <Paper>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox"><Checkbox disabled /></TableCell>
              <TableCell>Nome</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tiposPaginados.length > 0 ? (
              tiposPaginados.map((tipo) => (
                <TableRow key={tipo.tipo_localizacao_id}>
                  <TableCell padding="checkbox"><Checkbox /></TableCell>
                  <TableCell>{tipo.tipo}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => navigate(`/tipo-localizacao/${tipo.tipo_localizacao_id}/editar`)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleExcluir(tipo.tipo_localizacao_id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Layout>
  );
};

export default TipoLocalizacaoPage;
