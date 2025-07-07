import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  IconButton,
  Button,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Layout from '../components/Layout';
import { buscarArmazem, Armazem as ArmazemAPI } from '../services/API';
import { useNavigate } from 'react-router-dom';
import { excluirArmazem } from '../services/API';

// Se o backend já retornar capacidade, adicione no tipo abaixo; caso contrário, ficará opcional
interface Armazem extends ArmazemAPI {
  capacidade?: number;
}

const ArmazemPage: React.FC = () => {
  const navigate = useNavigate();


  // Estado principal
  const [armazens, setArmazens] = useState<Armazem[]>([]);
  const [busca, setBusca] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Carrega lista de armazéns direto do serviço
  useEffect(() => {
    const carregar = async () => {
      try {
        const dados = await buscarArmazem();
        setArmazens(dados);
      } catch (error: any) {
        alert(error.message);
      }
    };

    carregar();
  }, []);
  const handleExcluir = async (id: number) => {
  const confirmar = window.confirm('Tem certeza que deseja excluir este armazém?');
  if (!confirmar) return;

  try {
    await excluirArmazem(id);
    setArmazens((prev) => prev.filter((a) => a.armazem_id !== id));
    alert('Armazém excluído com sucesso!');
  } catch (err: any) {
    alert(err.message ?? 'Erro ao excluir armazém.');
  }
};

  // Filtro por texto digitado
  const filtrados = useMemo(() => {
    const texto = busca.toLowerCase();
    return armazens.filter(
      (a) =>
        a.nome.toLowerCase().includes(texto) ||
        a.endereco.toLowerCase().includes(texto)
    );
  }, [armazens, busca]);

  // Paginação
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtrados.slice(start, start + itemsPerPage);
  }, [filtrados, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / itemsPerPage));

  return (
    <Layout totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Armazém
      </Typography>
      {/* Barra superior: busca + botão */}
      <Box display="flex" gap={2} mb={3} alignItems="center" flexWrap="wrap">
        <TextField
          placeholder="Busca"
          variant='outlined'
          size='small'
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          sx={{ maxWidth: 480, width: 380 }}
        />

        <Button
          variant="contained"
          onClick={() => navigate('/CriarArmazem')}
          sx={{ backgroundColor: '#59e60d', color: '#000', fontWeight: 'bold' }}
          startIcon={<AddIcon />}
        >
          Novo Armazém
        </Button>
      </Box>

      {/* Tabela de Armazéns */}
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox"></TableCell>
              <TableCell>Armazém</TableCell>
              <TableCell>Capacidade</TableCell>
              <TableCell>Endereço</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.length ? (
              paginatedData.map((item) => (
                <TableRow key={item.armazem_id}>
                  <TableCell padding="checkbox">
                    <Checkbox />
                  </TableCell>

                  <TableCell>{item.nome}</TableCell>
                  <TableCell>{item.capacidade ?? '-'}</TableCell>
                  <TableCell>{item.endereco}</TableCell>

                  <TableCell align="right">
                    <IconButton onClick={() => navigate(`/EditarArmazem/${item.armazem_id}`)}>
                      <EditIcon />
                    </IconButton>

                    <IconButton>
                      <DeleteIcon onClick={() => handleExcluir(item.armazem_id)} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
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

export default ArmazemPage;