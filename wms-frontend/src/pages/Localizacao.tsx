import React, { useEffect, useState } from 'react';
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
  const navigate = useNavigate();



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

  /* ---------------------------------------------------------------------- */
  /* JSX                                                                    */
  /* ---------------------------------------------------------------------- */
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

      {/* Placeholder simples para indicar que algo será exibido futuramente */}
      {mostrarFiltro && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          Área de filtros em construção…
        </Typography>
      )}


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
                  <TableCell>{item.endereco}</TableCell>
                  <TableCell>{item.ean}</TableCell>

                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => alert(`Ver produtos em ${item.localizacao}`)}
                    >
                      <ListIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleImprimir(item.localizacao, item.ean)}>
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
