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

const itemsPerPage = 5;

const Localizacao: React.FC = () => {
  const {
    listaLocalizacoes,
    busca,
    setBusca,
    mostrarFormulario,
    mostrarFiltro,
    setMostrarFormulario,
    setMostrarFiltro,
    setListaLocalizacoes,
  } = useLocalizacoes();

  const navigate = useNavigate();

  // Filtros avançados
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [filtroArmazem, setFiltroArmazem] = useState<string>('');

  // Seleção / paginação
  const [selectedItems, setSelectedItems] = useState<number[]>([]); // índices na lista original
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // State do menu de filtro
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const filteredIndices = useMemo(() => {
    return listaLocalizacoes.reduce<number[]>((acc, loc, idx) => {
      const termo = busca.trim().toLowerCase();
      const matchBusca =
        termo === '' ||
        [loc.nome, loc.tipo, loc.armazem, loc.ean]
          .filter(Boolean)
          .some((campo) => campo.toString().toLowerCase().includes(termo));

      const matchTipo = !filtroTipo || loc.tipo === filtroTipo;
      const matchArmazem = !filtroArmazem || loc.armazem === filtroArmazem;

      if (matchBusca && matchTipo && matchArmazem) acc.push(idx);
      return acc;
    }, []);
  }, [listaLocalizacoes, busca, filtroTipo, filtroArmazem]);

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
  }, [busca, filtroTipo, filtroArmazem]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedItems(currentIndices);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (originalIndex: number, checked: boolean) => {
    if (checked) {
      setSelectedItems((prev) => [...prev, originalIndex]);
    } else {
      setSelectedItems((prev) => prev.filter((idx) => idx !== originalIndex));
      setSelectAll(false);
    }
  };

  useEffect(() => {
    const allCurrentSelected =
      currentIndices.length > 0 && currentIndices.every((idx) => selectedItems.includes(idx));
    setSelectAll(allCurrentSelected);
  }, [selectedItems, currentIndices]);

  const handleExcluir = async (id: number, nome: string, quantidade: number) => {
    if (quantidade > 0) {
      alert('Só é possível excluir localizações com quantidade 0.');
      return;
    }

    if (!window.confirm(`Deseja excluir a localização "${nome}"?`)) return;

    try {
      await excluirLocalizacao({ localizacao_id: id });
      alert(`Localização "${nome}" excluída com sucesso!`);
      setListaLocalizacoes((prev) => prev.filter((loc) => loc.localizacao_id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleExcluirSelecionados = async () => {
    if (selectedItems.length === 0) {
      alert('Selecione pelo menos uma localização.');
      return;
    }

    const permitidos = selectedItems.filter((idx) => listaLocalizacoes[idx].quantidade === 0);
    const bloqueados = selectedItems.filter((idx) => listaLocalizacoes[idx].quantidade > 0);

    if (permitidos.length === 0) {
      alert('Nenhuma das localizações selecionadas pode ser excluída (quantidade > 0).');
      return;
    }

    const nomesPermitidos = permitidos.map((idx) => listaLocalizacoes[idx].nome);
    const nomesBloqueados = bloqueados.map((idx) => listaLocalizacoes[idx].nome);

    if (
      !window.confirm(
        `Tem certeza que deseja excluir as seguintes localizações?\n\n${nomesPermitidos.join(', ')}`,
      )
    )
      return;

    const erros: string[] = [];

    for (const idx of permitidos) {
      const loc = listaLocalizacoes[idx];
      try {
        await excluirLocalizacao({ localizacao_id: loc.localizacao_id });
      } catch (err) {
        console.error(`Erro ao excluir ${loc.nome}:`, err);
        erros.push(loc.nome);
      }
    }

    setListaLocalizacoes((prev) =>
      prev.filter((_, idx) => !permitidos.includes(idx) || erros.includes(prev[idx].nome)),
    );

    setSelectedItems([]);
    setSelectAll(false);

    if (erros.length === 0) {
      alert('Localizações excluídas com sucesso!');
    } else {
      alert(`Algumas localizações não foram excluídas: ${erros.join(', ')}`);
    }

    if (nomesBloqueados.length > 0) {
      alert(
        `As seguintes localizações não puderam ser excluídas por conterem produtos:\n\n${nomesBloqueados.join(', ')}`,
      );
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
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            margin: 0; 
            padding: 24px;
            width: 10cm; /* Largura 10cm */
            height: 15cm; /* Altura 15cm */
            box-sizing: border-box;
          }
          h3 { 
            margin: 0 0 16px 0; 
            font-size: 30px; /* Aumenta o tamanho da fonte do título */
            font-weight: bold;
          }
          #barcode { 
            margin: 0 auto; 
            width: 100%; /* Garante que o código de barras ocupe toda a largura disponível */
          }
        </style>
      </head>
      <body>
        <h3>${localizacao}</h3>
        <svg id="barcode"></svg>
        <script>
          window.onload = function () {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js';
            script.onload = () => {
              JsBarcode('#barcode', '${ean}', {
                format: 'ean13',
                height: 120, /* Aumenta a altura do código de barras */
                displayValue: true,
                fontSize: 24 /* Aumenta o tamanho da fonte do valor do código de barras */
              });
              window.print();
              window.onafterprint = () => window.close();
            };
            document.body.appendChild(script);
          };
        </script>
      </body>
    </html>`;

    win.document.open();
    win.document.write(html);
    win.document.close();
  };



  const handleImprimirSelecionados = () => {
    if (selectedItems.length === 0) {
      alert('Selecione pelo menos um item para imprimir.');
      return;
    }

    selectedItems.forEach((idx, i) => {
      const item = listaLocalizacoes[idx];
      setTimeout(() => handleImprimir(item.nome, item.ean), i * 200); // delay evita sobreposição de janelas
    });
  };

  const tipos = useMemo(
    () => Array.from(new Set(listaLocalizacoes.map((l) => l.tipo).filter(Boolean))).sort(),
    [listaLocalizacoes],
  );
  const armazens = useMemo(
    () => Array.from(new Set(listaLocalizacoes.map((l) => l.armazem).filter(Boolean))).sort(),
    [listaLocalizacoes],
  );

  // Controle do menu de filtro
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLimparFiltros = () => {
    setFiltroTipo('');
    setFiltroArmazem('');
    setBusca('');
    handleMenuClose();
  };

  return (
    <Layout totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage}>
      <Container maxWidth="xl" sx={{ marginLeft: '10px' }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Localização
        </Typography>

        {/* Barra de ações */}
        <Box display="flex" gap={2} mb={3} alignItems="center" flexWrap="wrap">
          <TextField
            placeholder="Buscar Localização, tipo, armazém ou EAN"
            variant="outlined"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
            sx={{ maxWidth: 380 }}
          />

          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={handleMenuOpen}
            sx={{ minWidth: 110 }}
          >
            Filtro
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <Box sx={{ p: 2, width: 300 }}>
              <TextField
                select
                label="Tipo"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                sx={{ minWidth: '100%' }}
              >
                <MenuItem value="">Todos</MenuItem>
                {tipos.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Armazém"
                value={filtroArmazem}
                onChange={(e) => setFiltroArmazem(e.target.value)}
                sx={{ minWidth: '100%', mt: 2 }}
              >
                <MenuItem value="">Todos</MenuItem>
                {armazens.map((a) => (
                  <MenuItem key={a} value={a}>
                    {a}
                  </MenuItem>
                ))}
              </TextField>

              {filtroTipo || filtroArmazem ? (
                <Button
                  variant="outlined"
                  onClick={handleLimparFiltros}
                  sx={{ mt: 2, width: '100%' }}
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
                <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Nome</TableCell> {/* Cor do Nome */}
                <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Tipo</TableCell> {/* Cor do Tipo */}
                <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Armazém</TableCell> {/* Cor do Armazém */}
                <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>EAN</TableCell> {/* Cor do EAN */}
                <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Quantidade</TableCell> {/* Cor da Quantidade */}
                <TableCell align="center" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  Ações
                </TableCell> {/* Cor das Ações */}
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
                      <TableCell sx={{ fontWeight: 500 }}>{item.nome}</TableCell>
                      <TableCell>{item.tipo}</TableCell>
                      <TableCell>{item.armazem}</TableCell>
                      <TableCell>{item.ean}</TableCell>
                      <TableCell>{item.quantidade}</TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={1}>
                          <Tooltip title="Ver produtos">
                            <IconButton size="small" onClick={() => alert(`Ver produtos em ${item.nome}`)}>
                              <ListIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Imprimir etiqueta">
                            <IconButton size="small" onClick={() => handleImprimir(item.nome, item.ean)}>
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
      </Container>
    </Layout>
  );
};

export default Localizacao;
