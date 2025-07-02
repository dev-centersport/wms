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

/**
 * Componente principal da página de Localizações.
 * 
 * Responsável por:
 * - Exibir a lista de localizações em tabela
 * - Permitir busca por nome, tipo, armazém ou EAN
 * - Mostrar/esconder o formulário de nova localização
 * - Mostrar/esconder área de filtros
 * - Realizar ações de impressão, visualização e exclusão de localizações
 */
const Localizacao: React.FC = () => {
  // Hook personalizado que gerencia a lógica de localizações
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

  /**
   * Exclui uma localização da lista, se ela tiver quantidade 0.
   * Exibe alerta caso haja produtos na localização.
   * 
   * @param index Índice da localização na lista
   */
  const handleExcluir = (index: number) => {
    if (listaLocalizacoes[index].quantidade > 0) {
      alert('Só é possível excluir localizações com quantidade 0.');
      return;
    }
    setListaLocalizacoes(listaLocalizacoes.filter((_, i) => i !== index));
  };

  /**
   * Simula impressão dos dados de uma localização em nova aba.
   * 
   * @param localizacao Nome da localização a ser impressa
   */
  const handleImprimir = (localizacao: string) => {
    const win = window.open('', '_blank');
    win?.document.write(`<h1>Impressão – ${localizacao}</h1>`);
    win?.document.write('<p>Dados adicionais podem ser incluídos aqui.</p>');
    win?.print();
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Localizações
      </Typography>

      {/* Barra de busca e botões de ação */}
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

      {/* Área de filtros (ainda não implementada) */}
      {mostrarFiltro && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          Área de filtros em construção…
        </Typography>
      )}

      {/* Formulário de criação (ainda não implementado) */}
      {mostrarFormulario && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          Formulário de nova localização em construção…
        </Typography>
      )}

      {/* Tabela de localizações */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Localização</TableCell>
              <TableCell>Quantidade</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Armazém</TableCell>
              <TableCell>EAN</TableCell>
              <TableCell>Capacidade</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locaisFiltrados.length ? (
              locaisFiltrados.map((item, index) => (
                <TableRow key={`${item.localizacao}-${index}`}>
                  <TableCell>{item.localizacao}</TableCell>
                  <TableCell>{item.quantidade}</TableCell>
                  <TableCell>{item.tipo}</TableCell>
                  <TableCell>{item.armazem}</TableCell>
                  <TableCell>{item.ean}</TableCell>
                  <TableCell>{item.capacidade}</TableCell>
                  <TableCell align="center">
                    {/* Ação: Ver produtos da localização */}
                    <IconButton
                      size="small"
                      onClick={() => alert(`Ver produtos em ${item.localizacao}`)}
                    >
                      <ListIcon fontSize="small" />
                    </IconButton>

                    {/* Ação: Imprimir localização */}
                    <IconButton size="small" onClick={() => handleImprimir(item.localizacao)}>
                      <PrintIcon fontSize="small" />
                    </IconButton>

                    {/* Ação: Excluir localização (se quantidade for 0) */}
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
