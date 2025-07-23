import React, { useEffect, useMemo, useState } from 'react';
import { usePageLogger } from '../hooks/usePageLogger';

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
  TableContainer,
  Typography,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import Layout from '../components/Layout';
import { buscarArmazem, Armazem as ArmazemAPI, excluirArmazem } from '../services/API';
import { useNavigate } from 'react-router-dom';

interface Armazem extends ArmazemAPI {
  capacidade?: number;
}

const itemsPerPage = 50;

const ArmazemPage: React.FC = () => {
  usePageLogger('Armazem');
  const navigate = useNavigate();

  const [armazens, setArmazens] = useState<Armazem[]>([]);
  const [busca, setBusca] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filtroEndereco, setFiltroEndereco] = useState('');
  const [filtroNome, setFiltroNome] = useState('');
  const [appliedFiltroEndereco, setAppliedFiltroEndereco] = useState('');
  const [appliedFiltroNome, setAppliedFiltroNome] = useState('');

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

  const handleExcluir = async (id: number) => {
    const confirmar = window.confirm('Tem certeza que deseja excluir este armazém?');
    if (!confirmar) return;

    try {
      await excluirArmazem(id);
      setArmazens((prev) => prev.filter((a) => a.armazem_id !== id));
      alert('Armazém excluído com sucesso!');
    } catch (err: any) {
      alert(err.message ?? 'Erro ao excluir armazém.');
    }
  };

  const filteredIndices = useMemo(() => {
    return armazens.reduce<number[]>((acc, a, idx) => {
      const termo = busca.trim().toLowerCase();
      const matchBusca = termo === '' || a.nome.toLowerCase().includes(termo) || a.endereco.toLowerCase().includes(termo);
      const matchEndereco = !appliedFiltroEndereco || a.endereco === appliedFiltroEndereco;
      const matchNome = !appliedFiltroNome || a.nome === appliedFiltroNome;
      if (matchBusca && matchEndereco && matchNome) acc.push(idx);
      return acc;
    }, []);
  }, [armazens, busca, appliedFiltroEndereco, appliedFiltroNome]);

  const totalPages = Math.ceil(filteredIndices.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIndices = filteredIndices.slice(startIndex, endIndex);
  const currentItems = currentIndices.map((i) => armazens[i]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [busca, appliedFiltroEndereco, appliedFiltroNome]);

  useEffect(() => {
    const allSelected = currentIndices.length > 0 && currentIndices.every((idx) => selectedItems.includes(idx));
    setSelectAll(allSelected);
  }, [selectedItems, currentIndices]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedItems(checked ? currentIndices : []);
  };

  const handleSelectItem = (originalIdx: number, checked: boolean) => {
    setSelectedItems((prev) => (checked ? [...prev, originalIdx] : prev.filter((i) => i !== originalIdx)));
  };

  const enderecos = useMemo(() => Array.from(new Set(armazens.map((a) => a.endereco).filter(Boolean))).sort(), [armazens]);
  const nomes = useMemo(() => Array.from(new Set(armazens.map((a) => a.nome).filter(Boolean))).sort(), [armazens]);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleAplicarFiltro = () => {
    setAppliedFiltroEndereco(filtroEndereco);
    setAppliedFiltroNome(filtroNome);
    handleMenuClose();
  };

  const handleLimparFiltros = () => {
    setFiltroEndereco('');
    setFiltroNome('');
    setAppliedFiltroEndereco('');
    setAppliedFiltroNome('');
    setBusca('');
    handleMenuClose();
  };

  return (
    <Layout totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage}>
      {/* Título principal */}
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Armazém
      </Typography>

      {/* Barra de ações */}
      <Box display="flex" gap={2} mb={3} alignItems="center" flexWrap="wrap">
        <TextField
          placeholder="Buscar Armazém ou Endereço"
          variant="outlined"
          size="small"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
          }}
          sx={{ maxWidth: 480, width: 380 }}
        />

        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          sx={{ minWidth: 110 }}
          onClick={handleMenuOpen}
        >
          Filtro
        </Button>

        {/* Menu de filtros */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <Box sx={{ p: 2, width: 300 }}>
            <TextField
              select
              label="Armazém"
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              sx={{ minWidth: "100%" }}
            >
              <MenuItem value="">Todos</MenuItem>
              {nomes.map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Endereço"
              value={filtroEndereco}
              onChange={(e) => setFiltroEndereco(e.target.value)}
              sx={{ minWidth: "100%", mt: 2 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {enderecos.map((e) => (
                <MenuItem key={e} value={e}>
                  {e}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="outlined"
              onClick={handleAplicarFiltro}
              sx={{ mt: 2, width: "100%" }}
            >
              Aplicar Filtro
            </Button>

            {(filtroEndereco || filtroNome) && (
              <Button
                variant="outlined"
                onClick={handleLimparFiltros}
                sx={{ mt: 2, width: "100%" }}
              >
                Limpar filtros
              </Button>
            )}
          </Box>
        </Menu>

        {/* Botão limpar filtros fora do menu */}
        {(filtroEndereco || filtroNome) && (
          <Button
            variant="outlined"
            onClick={handleLimparFiltros}
            sx={{ minWidth: 130, ml: 1 }}
          >
            Limpar Filtros
          </Button>
        )}

        {/* Botão novo armazém */}
        <Button
          variant="contained"
          onClick={() => navigate("/criar-armazem")}
          sx={{
            backgroundColor: "#59e60d",
            color: "#000",
            fontWeight: "bold",
            minWidth: 165,
            "&:hover": { backgroundColor: "#48c307" }
          }}
          startIcon={<AddIcon />}
        >
          Novo Armazém
        </Button>
      </Box>

      {/* Tabela principal */}
      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2, maxHeight: 600, overflow: "auto" }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectAll}
                  indeterminate={selectedItems.length > 0 && !selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell align="left" sx={{ fontWeight: 600 }}>Armazém</TableCell>
              <TableCell align="left" sx={{ fontWeight: 600 }}>Capacidade</TableCell>
              <TableCell align="left" sx={{ fontWeight: 600 }}>Endereço</TableCell>
              <TableCell align="center" sx={{ fontWeight: 600 }}>
                Ações
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentItems.length ? (
              currentItems.map((item, idx) => {
                const originalIdx = currentIndices[idx];
                const isSelected = selectedItems.includes(originalIdx);

                return (
                  <TableRow key={item.armazem_id} selected={isSelected} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => handleSelectItem(originalIdx, e.target.checked)}
                      />
                    </TableCell>

                    <TableCell
                      align='left'
                      sx={{ fontWeight: 500, cursor: "pointer" }}
                      onClick={() => navigate(`/armazem/${item.armazem_id}/editar/`)}
                    >
                      {item.nome}
                    </TableCell>

                    <TableCell align="left" sx={{ pl: "55px" }}>
                      {item.capacidade ?? "-"}
                    </TableCell>
                    <TableCell>{item.endereco}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar armazém">
                        <IconButton onClick={() => navigate(`/armazem/${item.armazem_id}/editar/`)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir armazém">
                        <IconButton onClick={() => handleExcluir(item.armazem_id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Nenhum resultado encontrado.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Layout>
  );
}
export default ArmazemPage;