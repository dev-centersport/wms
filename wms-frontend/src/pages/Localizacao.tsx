import React, { useEffect, useMemo, useState } from 'react';
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
    MenuItem,
    Menu,
} from '@mui/material';
import { Search as SearchIcon, Delete as DeleteIcon, Print as PrintIcon, List as ListIcon, Add as AddIcon, FilterList as FilterListIcon } from '@mui/icons-material';

import Layout from '../components/Layout';
import { useLocalizacoes } from '../components/ApiComponents';
import { excluirLocalizacao } from '../services/API';

/* -------------------------------------------------------------------------- */
const itemsPerPage = 5;
/* -------------------------------------------------------------------------- */

const Localizacao: React.FC = () => {
    /* ------------------------- estados globais do hook ------------------------ */
    const {
        listaLocalizacoes,
        busca,
        setBusca,
        setListaLocalizacoes,
    } = useLocalizacoes();

    const navigate = useNavigate();

    /* ---------------------------- estados locais ----------------------------- */
    const [filtroTipo, setFiltroTipo] = useState<string>('');
    const [filtroArmazem, setFiltroArmazem] = useState<string>('');

    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    /* ------------------------------ filtragem ------------------------------ */
    const [appliedFiltroTipo, setAppliedFiltroTipo] = useState<string>('');
    const [appliedFiltroArmazem, setAppliedFiltroArmazem] = useState<string>('');

    const filteredIndices = useMemo(() => {
        return listaLocalizacoes.reduce<number[]>((acc, loc, idx) => {
            const termo = busca.trim().toLowerCase();
            const matchBusca =
                termo === '' ||
                [loc.nome, loc.tipo, loc.armazem, loc.ean]
                    .filter(Boolean)
                    .some((campo) => campo.toString().toLowerCase().includes(termo));

            const matchTipo = !appliedFiltroTipo || loc.tipo === appliedFiltroTipo;
            const matchArmazem = !appliedFiltroArmazem || loc.armazem === appliedFiltroArmazem;

            if (matchBusca && matchTipo && matchArmazem) acc.push(idx);
            return acc;
        }, []);
    }, [listaLocalizacoes, busca, appliedFiltroTipo, appliedFiltroArmazem]);

    /* ---------------------------- paginação ---------------------------- */
    const totalPages = Math.ceil(filteredIndices.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentIndices = filteredIndices.slice(startIndex, endIndex);
    const currentItems = currentIndices.map((i) => listaLocalizacoes[i]);

    /* ------------------------- efeitos auxiliares ------------------------ */
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages]);

    useEffect(() => {
        setCurrentPage(1);
    }, [busca, appliedFiltroTipo, appliedFiltroArmazem]);

    useEffect(() => {
        const allCurrentSelected =
            currentIndices.length > 0 && currentIndices.every((idx) => selectedItems.includes(idx));
        setSelectAll(allCurrentSelected);
    }, [selectedItems, currentIndices]);

    /* --------------------------- seleção tabela -------------------------- */
    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        setSelectedItems(checked ? currentIndices : []);
    };

    const handleSelectItem = (originalIndex: number, checked: boolean) => {
        setSelectedItems((prev) =>
            checked ? [...prev, originalIndex] : prev.filter((idx) => idx !== originalIndex)
        );
    };

    /* --------------------------- impressão --------------------------- */
    const handleImprimir = (localizacao: string, ean: string, tipo: string) => {
        const w = window.open('', '_blank');
        if (!w) return;

        const isCaixa = tipo.toLowerCase().includes('caixa');
        const largura = isCaixa ? '10cm' : '5cm';
        const altura = isCaixa ? '15cm' : '10cm';
        const fontNome = isCaixa ? '120px' : '80px';  // Menor para prateleira
        const barHeight = isCaixa ? 90 : 50;  // Menor para prateleira
        const barFont = isCaixa ? 22 : 12;  // Menor para prateleira

        w.document.write(`
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
            // Ajusta o tamanho da fonte conforme o comprimento do texto
            const nome = document.getElementById('nome');
            const texto = '${localizacao}';
            let tamanhoFonte = 190;

            if (texto.length > 10) {
                tamanhoFonte = 70;
            } else if (texto.length > 8) {
                tamanhoFonte = 85;
            }

            nome.style.fontSize = tamanhoFonte + 'px';

            // Gera o código de barras
            JsBarcode('#barcode', '${ean}', {
                format: 'ean13',
                height: 60,
                displayValue: true,
                fontSize: 18
            });

            window.onload = () => {
                window.print();
                window.onafterprint = () => window.close();
            };
            </script>
        </body>
        </html>
    `;

    win.document.open();
    win.document.write(html);
    win.document.close();
  };

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

  return (
    <Layout totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage}>
      <Container maxWidth="xl" sx={{ marginLeft: '10px' }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Localização
        </Typography>

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
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Armazém</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Ean</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Quantidade</TableCell>
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
                      <TableCell sx={{ fontWeight: 500, textAlign: 'center' }}>{item.nome}</TableCell>
                      <TableCell sx={{ textAlign: 'center'}}>{item.tipo}</TableCell>
                      <TableCell sx={{ textAlign: 'center'}}>{item.armazem}</TableCell>
                      <TableCell sx={{ textAlign: 'center'}}>{item.ean}</TableCell>
                      <TableCell sx={{ textAlign: 'center'}}>{item.quantidade}</TableCell>
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
                                Limpar filtros
                            </Button>
                        ) : null}
                    </Box>
                </Menu>

                {/* Novo botão Limpar Filtros ao lado do botão Filtro */}
                {(filtroTipo || filtroArmazem) && (
                    <Button
                        variant="outlined"
                        onClick={handleLimparFiltros}
                        sx={{ minWidth: 130, ml: 1 }}
                    >
                        Limpar Filtros
                    </Button>
                )}

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
                                minWidth: 195,
                                '&:hover': { backgroundColor: '#48c307' },
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
                                minWidth: 185,
                                '&:hover': {
                                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                    borderColor: '#d32f2f',
                                },
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
                            minWidth: 165,
                            '&:hover': { backgroundColor: '#48c307' },
                        }}
                    >
                        Nova Localização
                    </Button>
                )}
            </Box>

            {/* Tabela principal */}
            <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={selectAll}
                                    indeterminate={selectedItems.length > 0 && !selectAll}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Nome</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Tipo</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Armazém</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: 'primary.main' }}>EAN</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: 'primary.main' }}>Quantidade</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: 'primary.main' }}>Ações</TableCell>
                        </TableRow>
                    </TableHead>


                    <TableBody>
                        {currentItems.length ? (
                            currentItems.map((item, idx) => {
                                const originalIndex = currentIndices[idx];
                                const isSelected = selectedItems.includes(originalIndex);

                                return (
                                    <TableRow key={`${item.nome}-${originalIndex}`} selected={isSelected} hover>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={isSelected}
                                                onChange={(e) => handleSelectItem(originalIndex, e.target.checked)}
                                            />
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => navigate(`/localizacao/${item.localizacao_id}/editar`)}

                                        >
                                            {item.nome}
                                        </TableCell>
                                        <TableCell>{item.tipo}</TableCell>


                                        <TableCell>{item.armazem}</TableCell>
                                        <TableCell align="center">{item.ean}</TableCell>
                                        <TableCell align="center">{item.quantidade}</TableCell>

                                        <TableCell align="center">
                                            <Box display="flex" justifyContent="center" gap={1}>
                                                <Tooltip title="Ver produtos">
                                                    <IconButton size="small" onClick={() => alert(`Ver produtos em ${item.nome}`)}>
                                                        <ListIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Imprimir etiqueta">
                                                    <IconButton size="small" onClick={() => handleImprimir(item.nome, item.ean, item.tipo)}>
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
                                                                backgroundColor:
                                                                    item.quantidade > 0 ? 'transparent' : 'rgba(211, 47, 47, 0.1)',
                                                            },
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
