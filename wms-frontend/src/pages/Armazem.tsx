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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Layout from '../components/Layout';
import { buscarArmazem, Armazem as ArmazemAPI } from '../services/API';
import { useNavigate } from 'react-router-dom';

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
      {/* Barra superior: busca + botão */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <TextField
          placeholder="Busca"
          size="small"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          sx={{ width: 300 }}
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
                    <IconButton>
                      <EditIcon />
                    </IconButton>
                    <IconButton>
                      <DeleteIcon />
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