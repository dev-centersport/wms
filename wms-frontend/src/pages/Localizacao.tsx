import React from 'react';
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
  Collapse,
} from '@mui/material';
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  List as ListIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useLocalizacoes } from '../components/ApiComponents';

const Armazem: React.FC = () => {
  const {
    listaLocalizacoes,
    locaisFiltrados,
    busca,
    setBusca,
    mostrarFormulario,
    setMostrarFormulario,
    mostrarFiltro,
    setMostrarFiltro,
    setListaLocalizacoes,
  } = useLocalizacoes();

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Localizações de Armazém
      </Typography>

      <Box display="flex" gap={2} alignItems="center" mb={2}>
        <TextField
          label="Buscar localização"
          variant="outlined"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          size="small"
        />
        <IconButton onClick={() => setMostrarFiltro(!mostrarFiltro)}>
          <FilterListIcon />
        </IconButton>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          Nova Localização
        </Button>
      </Box>

      {/* Filtro expandido */}
      <Collapse in={mostrarFiltro}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1">Filtros adicionais</Typography>
          {/* Aqui você pode colocar filtros por tipo, armazém, status etc */}
          <TextField label="Filtrar por tipo" variant="outlined" size="small" sx={{ mr: 2 }} />
          <TextField label="Filtrar por armazém" variant="outlined" size="small" />
        </Paper>
      </Collapse>

      {/* Formulário para nova localização */}
      <Collapse in={mostrarFormulario}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>Nova Localização</Typography>
          {/* Formulário completo aqui (campos de nome, tipo, armazém, dimensões etc) */}
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField label="Nome" variant="outlined" size="small" />
            <TextField label="Altura" variant="outlined" size="small" />
            <TextField label="Largura" variant="outlined" size="small" />
            <TextField label="Comprimento" variant="outlined" size="small" />
            <TextField label="Tipo" variant="outlined" size="small" />
            <TextField label="Armazém" variant="outlined" size="small" />
          </Box>
          <Box mt={2}>
            <Button variant="contained" color="success">Salvar</Button>
          </Box>
        </Paper>
      </Collapse>

      {/* Tabela de localizações */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Localização</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Armazém</TableCell>
              <TableCell>Endereço</TableCell>
              <TableCell>EAN</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locaisFiltrados.length ? (
              locaisFiltrados.map((item, index) => (
                <TableRow key={`${item.localizacao}-${index}`}>
                  <TableCell>{item.localizacao}</TableCell>
                  <TableCell>{item.tipo}</TableCell>
                  <TableCell>{item.armazem}</TableCell>
                  <TableCell>{item.endereco}</TableCell>
                  <TableCell>{item.ean}</TableCell>
                  <TableCell align="right">
                    <IconButton color="error">
                      <DeleteIcon />
                    </IconButton>
                    <IconButton color="primary">
                      <PrintIcon />
                    </IconButton>
                    <IconButton color="secondary">
                      <ListIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Armazem;
