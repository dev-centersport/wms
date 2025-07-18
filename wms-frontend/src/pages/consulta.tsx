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
  TableSortLabel,
  Chip,
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
  const [orderBy, setOrderBy] = useState<keyof ConsultaEstoque>('descricao');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');

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

  const handleSort = (property: keyof ConsultaEstoque) => {
    const isAsc = orderBy === property && orderDirection === 'asc';
    setOrderDirection(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const termo = normalizar(busca);

  const filteredItems = lista.filter((item) => {
    const campos = [item.descricao, item.sku, item.ean, item.armazem, item.localizacao]
      .filter(Boolean)
      .map((c) => normalizar(c));

    const matchBusca = termo === '' || campos.some((c) => c.includes(termo));
    const matchArmazem = !appliedFiltroArmazem || normalizar(item.armazem).includes(normalizar(appliedFiltroArmazem));

    return matchBusca && matchArmazem;
  });

  const sortedItems = filteredItems.sort((a, b) => {
    const aVal = a[orderBy];
    const bVal = b[orderBy];

    const aStr = typeof aVal === 'string' ? aVal.toLowerCase() : aVal;
    const bStr = typeof bVal === 'string' ? bVal.toLowerCase() : bVal;

    if (aStr < bStr) return orderDirection === 'asc' ? -1 : 1;
    if (aStr > bStr) return orderDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedItems.slice(startIndex, endIndex);

  useEffect(() => {
    // Se o filtro ou busca mudar, volte para página 1
    setCurrentPage(1);
  }, [busca, appliedFiltroArmazem]);

  useEffect(() => {
    // Ajuste de página se o total de páginas diminui
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages]);

  useEffect(() => {
    const allSelected =
      currentItems.length > 0 &&
      currentItems.every((item) => selectedItems.includes(item.produto_id));
    setSelectAll(allSelected);
  }, [selectedItems, currentItems]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedItems(checked ? currentItems.map((i) => i.produto_id) : []);
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    setSelectedItems((prev) =>
      checked ? [...prev, id] : prev.filter((pid) => pid !== id)
    );
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
          <>
            <Chip
              label={`Filtro: Armazém - ${appliedFiltroArmazem}`}
              color="primary"
              variant="filled"
              sx={{
                backgroundColor: '#61de27',
                color: '#000',
                fontWeight: 'bold',
                px: 1.5,
                height: 32,
                borderRadius: '8px',
              }}
            />
            <Button
              variant="outlined"
              onClick={handleLimparFiltro}
              sx={{
                height: 32,
                padding: '6px 16px',
              }}
            >
              Limpar Filtro
            </Button>
          </>
        )}
      </Box>

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

              <TableCell sortDirection={orderBy === 'descricao' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'descricao'}
                  direction={orderBy === 'descricao' ? orderDirection : 'asc'}
                  onClick={() => handleSort('descricao')}
                >
                  Descrição
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={orderBy === 'sku' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'sku'}
                  direction={orderBy === 'sku' ? orderDirection : 'asc'}
                  onClick={() => handleSort('sku')}
                >
                  SKU
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={orderBy === 'ean' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'ean'}
                  direction={orderBy === 'ean' ? orderDirection : 'asc'}
                  onClick={() => handleSort('ean')}
                >
                  EAN
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={orderBy === 'armazem' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'armazem'}
                  direction={orderBy === 'armazem' ? orderDirection : 'asc'}
                  onClick={() => handleSort('armazem')}
                >
                  Armazém
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={orderBy === 'quantidade' ? orderDirection : false} align="left">
                <TableSortLabel
                  active={orderBy === 'quantidade'}
                  direction={orderBy === 'quantidade' ? orderDirection : 'asc'}
                  onClick={() => handleSort('quantidade')}
                >
                  Qtd
                </TableSortLabel>
              </TableCell>

              <TableCell sortDirection={orderBy === 'localizacao' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'localizacao'}
                  direction={orderBy === 'localizacao' ? orderDirection : 'asc'}
                  onClick={() => handleSort('localizacao')}
                >
                  Localização
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentItems.length ? (
              currentItems.map((item, idx) => {
                const isSelected = selectedItems.includes(item.produto_id);

                return (
                  <TableRow key={item.produto_id} hover selected={isSelected}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => handleSelectItem(item.produto_id, e.target.checked)}
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
    </Layout >
  );
};

export default Consulta;
