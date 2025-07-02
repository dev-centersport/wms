import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  List as ListIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { error } from 'console';

/* -------------------------------------------------------------------------- */
/* Tipagem de cada linha da tabela                                            */
/* -------------------------------------------------------------------------- */
interface Localizacao {
  localizacao: string;
  quantidade: number;
  tipo: string;
  armazem: string;
  capacidade: number;
  ean: string;
}

/* -------------------------------------------------------------------------- */
/* Componente                                                                 */
/* -------------------------------------------------------------------------- */
const Localizacao: React.FC = () => {
  /* ---------- Estados principais ---------- */
  const [listaLocalizacoes, setListaLocalizacoes] = useState<Localizacao[]>([]);
  const [busca, setBusca] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFiltro, setMostrarFiltro] = useState(false);

  /* ---------- Carrega dados reais do backend ---------- */
  useEffect(() => {
    axios
      .get('http://151.243.0.78:3001/localizacao')
      .then((res) => {
        const dados: Localizacao[] = res.data.map((item: any) => ({
          localizacao: item.nome ?? '',
          tipo: item.tipo?.tipo ?? '',
          armazem: item.armazem?.nome ?? '',
          ean: item.ean ?? '',
          
        }));
        setListaLocalizacoes(dados);
      })
      .catch((err) => {
        console.log('Erro ao buscar localizações →', err);
        alert('Falha ao carregar as localizações do servidor.');
      });
  }, []);

  /* ---------- Filtro de busca ---------- */
  const locaisFiltrados = listaLocalizacoes.filter((item) => {
    const texto = busca.toLowerCase();
    return (
      item.localizacao.toLowerCase().includes(texto) ||
      item.tipo.toLowerCase().includes(texto) ||
      item.armazem.toLowerCase().includes(texto) ||
      item.ean.toLowerCase().includes(texto)
    );
  });

  /* ---------- Ações ---------- */
  const handleExcluir = (index: number) => {
    if (listaLocalizacoes[index].quantidade > 0) {
      alert('Só é possível excluir localizações com quantidade 0.');
      return;
    }
    setListaLocalizacoes(listaLocalizacoes.filter((_, i) => i !== index));
  };

  const handleImprimir = (localizacao: string) => {
    const win = window.open('', '_blank');
    win?.document.write(`<h1>Impressão – ${localizacao}</h1>`);
    win?.document.write('<p>Dados adicionais podem ser incluídos aqui.</p>');
    win?.print();
  };

  /* ---------------------------------------------------------------------- */
  /* JSX                                                                    */
  /* ---------------------------------------------------------------------- */
  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Localizações
      </Typography>

      {/* Barra de busca e botões */}
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="Buscar localização, tipo, armazém ou EAN"
          variant="outlined"
          fullWidth
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          InputProps={{ endAdornment: <SearchIcon /> }}
        />
        <Button startIcon={<FilterListIcon />} onClick={() => setMostrarFiltro(!mostrarFiltro)}>
          Filtros
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          Nova
        </Button>
      </Box>

      {/* Placeholder simples para indicar que algo será exibido futuramente */}
      {mostrarFiltro && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          Área de filtros em construção…
        </Typography>
      )}
      {mostrarFormulario && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          Formulário de nova localização em construção…
        </Typography>
      )}

      {/* Tabela */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Localização</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Armazém</TableCell>
              <TableCell>EAN</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locaisFiltrados.length ? (
              locaisFiltrados.map((item, index) => (
                <TableRow key={`${item.localizacao}-${index}`}>
                  <TableCell>{item.localizacao}</TableCell>
                  <TableCell>{item.tipo}</TableCell>
                  <TableCell>{item.armazem}</TableCell>
                  <TableCell>{item.ean}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => alert(`Ver produtos em ${item.localizacao}`)}
                    >
                      <ListIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleImprimir(item.localizacao)}>
                      <PrintIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleExcluir(index)}
                      disabled={item.quantidade > 0}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Nenhuma localização encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Localizacao;
