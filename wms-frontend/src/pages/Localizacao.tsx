import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import JsBarcode from 'jsbarcode';

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
  Checkbox,
  Tooltip,
} from '@mui/material';

import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  List as ListIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

import Layout from '../components/Layout';
import { useLocalizacoes } from '../components/ApiComponents';
import { excluirLocalizacao } from '../services/API';

/**
 * Componente principal da página de Localizações.
 *
 * Responsável por:
 * - Exibir a lista de localizações em tabela
 * - Permitir busca por nome, tipo, armazém ou EAN
 * - Mostrar/esconder o formulário de nova localização
 * - Mostrar/esconder área de filtros
 * - Realizar ações de impressão, visualização e exclusão de localizações
 * - Permitir seleção múltipla de itens
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

  const navigate = useNavigate();

  // Estados para seleção múltipla
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calcular itens da página atual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = locaisFiltrados.slice(startIndex, endIndex);
  const totalPages = Math.ceil(locaisFiltrados.length / itemsPerPage);

  // Função para selecionar/deselecionar todos os itens
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedItems(currentItems.map((_, index) => startIndex + index));
    } else {
      setSelectedItems([]);
    }
  };

  // Função para selecionar/deselecionar um item específico
  const handleSelectItem = (index: number, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, index]);
    } else {
      setSelectedItems(selectedItems.filter(item => item !== index));
      setSelectAll(false);
    }
  };

  // Atualizar selectAll quando todos os itens da página estão selecionados
  useEffect(() => {
    const currentPageIndices = currentItems.map((_, index) => startIndex + index);
    const allCurrentSelected = currentPageIndices.every(index => selectedItems.includes(index));
    setSelectAll(allCurrentSelected && currentPageIndices.length > 0);
  }, [selectedItems, currentItems, startIndex]);

  /**
   * Exclui uma localização da lista, se ela tiver quantidade 0.
   * Exibe alerta caso haja produtos na localização.
   */
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

  // Função para excluir itens selecionados
  const handleExcluirSelecionados = () => {
    const itemsToDelete = selectedItems.filter(index => listaLocalizacoes[index].quantidade === 0);

    if (itemsToDelete.length === 0) {
      alert('Só é possível excluir localizações com quantidade 0.');
      return;
    }

    if (itemsToDelete.length !== selectedItems.length) {
      alert('Algumas localizações não podem ser excluídas pois possuem produtos.');
    }

    const newList = listaLocalizacoes.filter((_, index) => !itemsToDelete.includes(index));
    setListaLocalizacoes(newList);
    setSelectedItems([]);
    setSelectAll(false);
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

  // Função para imprimir itens selecionados
  const handleImprimirSelecionados = () => {
    if (selectedItems.length === 0) {
      alert('Selecione pelo menos um item para imprimir.');
      return;
    }

    selectedItems.forEach(index => {
      const item = listaLocalizacoes[index];
      setTimeout(() => handleImprimir(item.nome, item.ean), 100);
    });
  };

  /* ---------------------------------------------------------------------- */
  /* JSX                                                                    */
  /* ---------------------------------------------------------------------- */
  return (
    <Layout totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage}>
      <Container maxWidth="xl" sx={{ mt: 4, px: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Localização
        </Typography>

        {/* Barra de busca e botões de ação */}
        <Box display="flex" gap={2} mb={3} alignItems="center">
          <TextField
            placeholder="Buscar Localização, tipo, armazém ou EAN"
            variant="outlined"
            fullWidth
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ maxWidth: 400 }}
          />

          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setMostrarFiltro(!mostrarFiltro)}
            sx={{ minWidth: 100 }}
          >
            Filtro
          </Button>

          {/* Renderização condicional dos botões */}
          {selectedItems.length > 0 ? (
            <>
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={handleImprimirSelecionados}
                sx={{
                  backgroundColor: '#61de27',
                  color: '#000',
                  fontWeight: 'bold',
                  minWidth: 180,
                  '&:hover': { backgroundColor: '#48c307' }
                }}
              >
                Imprimir Selecionados
              </Button>

              <Button
                variant="outlined"
                startIcon={<DeleteIcon />}
                onClick={handleExcluirSelecionados}
                sx={{
                  borderColor: '#d32f2f',
                  color: '#d32f2f',
                  fontWeight: 'bold',
                  minWidth: 170,
                  '&:hover': {
                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                    borderColor: '#d32f2f'
                  }
                }}
              >
                Excluir Selecionados
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/CriarLocalizacao')}
              sx={{
                backgroundColor: '#61de27',
                color: '#000',
                fontWeight: 'bold',
                minWidth: 150,
                '&:hover': { backgroundColor: '#48c307' }
              }}
            >
              Nova Localização
            </Button>
          )}
        </Box>

        {/* Placeholder simples para indicar que algo será exibido futuramente */}
        {mostrarFiltro && (
          <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="body2" color="text.secondary">
              Área de filtros em construção…
            </Typography>
          </Paper>
        )}

        {/* Formulário de criação (ainda não implementado) */}
        {mostrarFormulario && (
          <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="body2" color="text.secondary">
              Formulário de nova localização em construção…
            </Typography>
          </Paper>
        )}

        {/* Tabela de localizações */}
        <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    indeterminate={selectedItems.length > 0 && !selectAll}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Armazém</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ean</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Quantidade</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentItems.length ? (
                currentItems.map((item, index) => {
                  const globalIndex = startIndex + index;
                  const isSelected = selectedItems.includes(globalIndex);

                  return (
                    <TableRow
                      key={`${item.nome}-${globalIndex}`}
                      selected={isSelected}
                      hover
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => handleSelectItem(globalIndex, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{item.nome}</TableCell>
                      <TableCell>{item.tipo}</TableCell>
                      <TableCell>{item.armazem}</TableCell>
                      <TableCell>{item.ean}</TableCell>
                      <TableCell>{item.quantidade}</TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={1}>
                          <Tooltip title="Ver produtos">
                            <IconButton
                              size="small"
                              onClick={() => alert(`Ver produtos em ${item.nome}`)}
                            >
                              <ListIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Imprimir etiqueta">
                            <IconButton
                              size="small"
                              onClick={() => handleImprimir(item.nome, item.ean)}
                            >
                              <PrintIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Excluir localização">
                            <IconButton
                              size="small"
                              onClick={() => handleExcluir(item.localizacao_id, item.nome, item.quantidade ?? 0)}
                              disabled={item.quantidade > 0}
                              sx={{
                                color: item.quantidade > 0 ? 'text.disabled' : 'error.main',
                                '&:hover': {
                                  backgroundColor: item.quantidade > 0 ? 'transparent' : 'rgba(211, 47, 47, 0.1)'
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      Nenhuma localização encontrada.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Layout>
  );
};

export default Localizacao;