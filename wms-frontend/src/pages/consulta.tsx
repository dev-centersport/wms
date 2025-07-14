import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Menu,
  MenuItem,
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterListIcon } from '@mui/icons-material';

import Layout from '../components/Layout';
import { buscarConsultaEstoque } from '../services/API';

const itemsPerPage = 50;

interface ConsultaEstoque {
  produto_id: number;
  descricao: string;
  sku: string;
  ean: string;
  armazem: string;
  localizacao: string;
  quantidade: number;
}

// Função utilitária para remover acentuação e normalizar texto
const normalizar = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // sem necessidade de ES2018
    .toLowerCase()
    .trim();

const Consulta: React.FC = () => {
  const [lista, setLista] = useState<ConsultaEstoque[]>([]);
  const [busca, setBusca] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtro de armazém
  const [filtroArmazem, setFiltroArmazem] = useState('');
  const [appliedFiltroArmazem, setAppliedFiltroArmazem] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const dados = await buscarConsultaEstoque();
        setLista(dados);
      } catch (err) {
        console.error('Erro ao carregar dados da consulta:', err);
      }
    };
    carregarDados();
  }, []);

  // Lista única de armazéns para o select
  const armazens = useMemo(
    () => Array.from(new Set(lista.map((i) => i.armazem).filter(Boolean))).sort(),
    [lista]
  );

  const filteredIndices = useMemo(() => {
    const termo = normalizar(busca);
    return lista.reduce<number[]>((acc, item, idx) => {
      const campos = [item.descricao, item.sku, item.ean, item.armazem, item.localizacao]
        .filter(Boolean)
        .map((c) => normalizar(c));

      const matchBusca = termo === '' || campos.some((c) => c.includes(termo));
      const matchArmazem =
        !appliedFiltroArmazem || normalizar(item.armazem).includes(normalizar(appliedFiltroArmazem));

      if (matchBusca && matchArmazem) acc.push(idx);
      return acc;
    }, []);
  }, [lista, busca, appliedFiltroArmazem]);

  const totalPages = Math.ceil(filteredIndices.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIndices = filteredIndices.slice(startIndex, endIndex);
  const currentItems = currentIndices.map((i) => lista[i]);

  useEffect(() => {
    // Se o filtro ou busca mudar, volte para página 1
    setCurrentPage(1);
  }, [busca, appliedFiltroArmazem]);

  useEffect(() => {
    // Ajuste de página se o total de páginas diminui
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages]);

  useEffect(() => {
    const allSelected = currentIndices.length > 0 && currentIndices.every((idx) => selectedItems.includes(idx));
    setSelectAll(allSelected);
  }, [currentIndices, selectedItems]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedItems(checked ? currentIndices : []);
  };

  const handleSelectItem = (originalIndex: number, checked: boolean) => {
    setSelectedItems((prev) => (checked ? [...prev, originalIndex] : prev.filter((idx) => idx !== originalIndex)));
  };

  // Handlers do menu de filtros
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleAplicarFiltro = () => {
    setAppliedFiltroArmazem(filtroArmazem);
    handleMenuClose();
  };

  const handleLimparFiltro = () => {
    setFiltroArmazem('');
    setAppliedFiltroArmazem('');
    handleMenuClose();
  };

  return (
    <Layout totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Consulta
      </Typography>

      {/* Barra de ações */}
      <Box display="flex" gap={2} mb={3} alignItems="center" flexWrap="wrap">
        <TextField
          placeholder="Busca por nome, SKU, EAN ou localização"
          variant="outlined"
          size="small"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
          sx={{ maxWidth: 480, width: 380 }}
        />

        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={handleMenuOpen}
          sx={{
            minWidth: 110,
            backgroundColor: appliedFiltroArmazem ? '#f0f0f0' : 'transparent',
            borderColor: appliedFiltroArmazem ? '#999' : undefined,
            color: appliedFiltroArmazem ? '#333' : undefined,
            fontWeight: appliedFiltroArmazem ? 'bold' : 'normal',
          }}
        >
          Filtro
        </Button>


        {appliedFiltroArmazem && (
          <Button
            variant="outlined"
            onClick={handleLimparFiltro}
            sx={{ minWidth: 130 }}
          >
            Limpar Filtro
          </Button>
        )}

        {/* Menu de filtro por armazém */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <Box sx={{ p: 2, width: 260 }}>
            <TextField
              select
              label="Armazém"
              value={filtroArmazem}
              onChange={(e) => setFiltroArmazem(e.target.value)}
              sx={{ minWidth: '100%' }}
            >
              <MenuItem value="">Todos</MenuItem>
              {armazens.map((a) => (
                <MenuItem key={a} value={a}>
                  {a}
                </MenuItem>
              ))}
            </TextField>

            <Button variant="outlined" sx={{ mt: 2, width: '100%' }} onClick={handleAplicarFiltro}>
              Aplicar
            </Button>

            {filtroArmazem && (
              <Button variant="outlined" sx={{ mt: 2, width: '100%' }} onClick={handleLimparFiltro}>
                Limpar filtro
              </Button>
            )}
          </Box>
        </Menu>
      </Box>


      {/* Tabela principal */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, maxHeight: 'auto', overflow: 'auto' }}>
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
              <TableCell sx={{ fontWeight: 600 }}>Descrição</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>EAN</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Armazém</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Qtd</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Localização</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentItems.length ? (
              currentItems.map((item, idx) => {
                const originalIndex = currentIndices[idx];
                const isSelected = selectedItems.includes(originalIndex);

                return (
                  <TableRow key={item.produto_id} hover selected={isSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => handleSelectItem(originalIndex, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>{item.descricao}</TableCell>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.ean}</TableCell>
                    <TableCell>{item.armazem}</TableCell>
                    <TableCell>{item.quantidade}</TableCell>
                    <TableCell>{item.localizacao}</TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Nenhum item encontrado.
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

export default Consulta;
