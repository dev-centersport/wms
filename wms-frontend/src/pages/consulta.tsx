import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  TableSortLabel,
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
  localizacao_ean: string
  quantidade: number;
}

const normalizar = (s: string) =>
  String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const Consulta: React.FC = () => {
  const [lista, setLista] = useState<ConsultaEstoque[]>([]);
  const [inputBusca, setInputBusca] = useState('');
  const [busca, setBusca] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [orderBy, setOrderBy] = useState<keyof ConsultaEstoque>('descricao');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');
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

  const armazens = useMemo(
    () => Array.from(new Set(lista.map((i) => i.armazem).filter(Boolean))).sort(),
    [lista]
  );

  const termo = normalizar(busca);

  const filteredItems = lista.filter((item) => {
    const campos = [item.descricao, item.sku, item.ean, item.armazem, item.localizacao, item.localizacao_ean].map((c) =>
      normalizar(c)
    );

    const matchBusca = termo === '' || campos.some((c) => c.includes(termo));
    const matchArmazem =
      !appliedFiltroArmazem || normalizar(item.armazem).includes(normalizar(appliedFiltroArmazem));

    return matchBusca && matchArmazem;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredItems.slice(start, end);
  }, [filteredItems, currentPage]);

  const currentItems = useMemo(() => {
    return [...paginatedItems].sort((a, b) => {
      const aVal = a[orderBy];
      const bVal = b[orderBy];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return orderDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = normalizar(String(aVal));
      const bStr = normalizar(String(bVal));

      if (aStr < bStr) return orderDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return orderDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [paginatedItems, orderBy, orderDirection]);

  useEffect(() => {
    setCurrentPage(1);
  }, [busca, appliedFiltroArmazem]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages]);

  const handleSort = (property: keyof ConsultaEstoque) => {
    const isAsc = orderBy === property && orderDirection === 'asc';
    setOrderDirection(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

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

      <Box display="flex" gap={2} mb={3} alignItems="center" flexWrap="wrap">
        <TextField
          placeholder="Busca por nome, SKU, EAN ou localização"
          variant="outlined"
          size="small"
          value={inputBusca}
          onChange={(e) => setInputBusca(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setBusca(inputBusca); // atualiza a busca real
            }
          }}
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
              sx={{
                backgroundColor: '#61de27',
                color: '#000',
                fontWeight: 'bold',
                px: 1.5,
                height: 32,
                borderRadius: '8px',
              }}
            />
            <Button variant="outlined" onClick={handleLimparFiltro} sx={{ height: 32 }}>
              Limpar Filtro
            </Button>
          </>
        )}
      </Box>

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

      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sortDirection={orderBy === 'descricao' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'descricao'}
                  direction={orderBy === 'descricao' ? orderDirection : 'asc'}
                  onClick={() => handleSort('descricao')}
                >
                  <strong>Descrição</strong>
                </TableSortLabel>
              </TableCell>

              <TableCell align="center" sortDirection={orderBy === 'sku' ? orderDirection : false}>
                <strong>SKU</strong>
              </TableCell>

              <TableCell align="center">
                <strong>EAN</strong>
              </TableCell>

              <TableCell align="center" sortDirection={orderBy === 'armazem' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'armazem'}
                  direction={orderBy === 'armazem' ? orderDirection : 'asc'}
                  onClick={() => handleSort('armazem')}
                >
                  <strong>Armazém</strong>
                </TableSortLabel>
              </TableCell>

              <TableCell align="center" sortDirection={orderBy === 'quantidade' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'quantidade'}
                  direction={orderBy === 'quantidade' ? orderDirection : 'asc'}
                  onClick={() => handleSort('quantidade')}
                >
                  <strong>Quantidade</strong>
                </TableSortLabel>
              </TableCell>

              <TableCell align="center" sortDirection={orderBy === 'localizacao' ? orderDirection : false}>
                <TableSortLabel
                  active={orderBy === 'localizacao'}
                  direction={orderBy === 'localizacao' ? orderDirection : 'asc'}
                  onClick={() => handleSort('localizacao')}
                >
                  <strong>Localização</strong>
                </TableSortLabel>
              </TableCell>

              <TableCell align="center">
                <strong>EAN Localização</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentItems.length ? (
              currentItems.map((item) => (
                <TableRow key={`${item.produto_id}-${item.localizacao}-${item.ean}`} hover>
                  <TableCell sx={{ pr: orderBy === 'descricao' ? 'auto' : '35px' }}>{item.descricao}</TableCell>

                  <TableCell align='center' sx={{ pr: orderBy === 'sku' ? 'auto' : '35px' }}>{item.sku}</TableCell>

                  <TableCell align="center">{item.ean}</TableCell>

                  <TableCell align='center' sx={{ pr: orderBy === 'armazem' ? 'auto' : '35px' }}>{item.armazem}</TableCell>

                  <TableCell sx={{ pr: orderBy === 'quantidade' ? 'auto' : '35px' }} align="center">{item.quantidade}</TableCell>

                  <TableCell sx={{ pr: orderBy === 'localizacao' ? 'auto' : '35px' }} align="center">{item.localizacao}</TableCell>

                  <TableCell align="center">{item.localizacao_ean}</TableCell>

                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
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
