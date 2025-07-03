import React from 'react';
import { useNavigate } from 'react-router-dom';
import JsBarcode from 'jsbarcode';
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
import { excluirLocalizacao } from '../services/API';

const Localizacao: React.FC = () => {
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
  const navigate = useNavigate();

  const handleExcluir = async (id: number, nome: string, quantidade: number) => {
    if (quantidade > 0) {
      alert('Só é possível excluir localizações com quantidade 0.');
      return;
    }

    const confirmar = window.confirm(`Deseja excluir a localização "${nome}"?`);
    if (!confirmar) return;

    try {
      await excluirLocalizacao({ localizacao_id: id });
      alert(`Localização "${nome}" excluída com sucesso!`);

      const atualizadas = listaLocalizacoes.filter(loc => loc.localizacao_id !== id);
      setListaLocalizacoes(atualizadas);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImprimir = (localizacao: string, ean: string) => {
    const win = window.open('', '_blank');
    if (!win) return;

    const html = `
        <html>
        <head>
            <title>Etiqueta – ${localizacao}</title>
            <style>
            body { font-family: Arial, sans-serif; text-align: center; margin: 0; padding: 24px; }
            h3   { margin: 0 0 16px 0; }
            </style>
        </head>
        <body>
            <h3>${localizacao}</h3>
            <svg id="barcode"></svg>
            <script>
            window.onload = function () {
                const script = document.createElement('script');
                script.src = "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js";
                script.onload = () => {
                JsBarcode("#barcode", "${ean}", {
                    format: "ean13",
                    height: 80,
                    displayValue: true,
                    fontSize: 18
                });
                window.print();
                window.onafterprint = () => window.close();
                };
                document.body.appendChild(script);
            };
            </script>
        </body>
        </html>
    `;

    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Localizações
      </Typography>

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
          onClick={() => navigate('/CriarLocalizacao')}
          sx={{
            backgroundColor: '#59e60d',
            color: '#000',
            fontWeight: 'bold',
            borderRadius: 2,
            paddingX: 3,
            textTransform: 'none',
            '&:hover': { backgroundColor: '#48c307' },
          }}
        >
          Nova
        </Button>
      </Box>

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
                <TableRow key={`${item.nome}-${index}`}>
                  <TableCell>{item.nome}</TableCell>
                  <TableCell>{item.tipo}</TableCell>
                  <TableCell>{item.armazem}</TableCell>
                  <TableCell>{item.ean}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => alert(`Ver produtos em ${item.nome}`)}
                    >
                      <ListIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleImprimir(item.nome, item.ean)}>
                      <PrintIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleExcluir(item.localizacao_id, item.nome, item.quantidade ?? 0)}
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
