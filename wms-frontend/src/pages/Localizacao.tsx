import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  Divider,
  Pagination,
  PaginationItem,
} from '@mui/material';

import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  List as ListIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  ArrowRightAlt as ArrowRightAltIcon,
} from '@mui/icons-material';

import { useLocalizacoes } from '../components/ApiComponents';
import Layout from '../components/Layout';

const itemsPerPage = 5;

const Localizacao: React.FC = () => {
  const {
    listaLocalizacoes,
    busca,
    setBusca,
    setListaLocalizacoes,
  } = useLocalizacoes();

  const navigate = useNavigate();

  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const filteredIndices = React.useMemo(() => {
    return listaLocalizacoes.reduce<number[]>((acc, loc, idx) => {
      const termo = busca.trim().toLowerCase();
      const matchBusca =
        termo === '' ||
        [loc.nome, loc.tipo, loc.armazem, loc.ean]
          .filter(Boolean)
          .some((campo) => campo.toString().toLowerCase().includes(termo));
      if (matchBusca) acc.push(idx);
      return acc;
    }, []);
  }, [listaLocalizacoes, busca]);

  const totalPages = Math.ceil(filteredIndices.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIndices = filteredIndices.slice(startIndex, endIndex);
  const currentItems = currentIndices.map((i) => listaLocalizacoes[i]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [busca]);

  useEffect(() => {
    const allCurrentSelected =
      currentIndices.length > 0 && currentIndices.every((idx) => selectedItems.includes(idx));
    setSelectAll(allCurrentSelected);
  }, [selectedItems, currentIndices]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedItems(checked ? currentIndices : []);
  };

  const handleSelectItem = (originalIndex: number, checked: boolean) => {
    setSelectedItems((prev) =>
      checked ? [...prev, originalIndex] : prev.filter((idx) => idx !== originalIndex)
    );
  };

  const handleExcluir = (index: number) => {
    if (listaLocalizacoes[index].quantidade > 0) {
      alert('Só é possível excluir localizações com quantidade 0.');
      return;
    }
    setListaLocalizacoes(listaLocalizacoes.filter((_, i) => i !== index));
    setSelectedItems(selectedItems.filter(item => item !== index));
  };

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
          @page {
            size: 150mm 100mm;
            margin: 0;
          }
          body {
            width: 150mm;
            height: 100mm;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
            overflow: hidden;
          }
          #nome {
            margin: 0;
            line-height: 1;
            font-weight: bold;
            width: 100%;
            text-align: center;
            word-break: break-word;
          }
          #barcode {
            width: 90%;
            margin-top: 4mm;
          }
        </style>
      </head>
      <body>
        <h1 id="nome">${localizacao}</h1>
        <svg id="barcode"></svg>

        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <script>
          const nome = document.getElementById('nome');
          const texto = '${localizacao}';
          let tamanhoFonte = 190;

          if (texto.length > 10) {
            tamanhoFonte = 70;
          } else if (texto.length > 8) {
            tamanhoFonte = 85;
          }

          nome.style.fontSize = tamanhoFonte + 'px';

          JsBarcode('#barcode', '${ean}', {
            format: 'ean13',
            height: 60,
            displayValue: true,
            fontSize: 18
          });

          window.addEventListener('load', () => {
            setTimeout(() => {
              window.print();
              window.addEventListener('afterprint', () => window.close());
            }, 100);
          });
        </script>
      </body>
      </html>
    `;

    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  const handleImprimirSelecionados = () => {
    selectedItems.forEach(index => {
      const item = listaLocalizacoes[index];
      setTimeout(() => handleImprimir(item.nome, item.ean), 100);
    });
  };

  return (
    <Layout totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} pageTitle='Localização'>
        <Box display="flex" gap={2} mb={3} alignItems="center">
            <TextField
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

        {mostrarFiltro && (
            <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="body2" color="text.secondary">
                Área de filtros em construção…
            </Typography>
            </Paper>
        )}

        {mostrarFormulario && (
            <Paper sx={{ p: 2, mb: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="body2" color="text.secondary">
                Formulário de nova localização em construção…
            </Typography>
            </Paper>
        )}

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
                <TableCell sx={{ fontWeight: 600 }}>EAN</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Quantidade</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Ações</TableCell>
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
                                onClick={() => handleExcluir(globalIndex)}
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
    </Layout>
  );
};

export default Localizacao;