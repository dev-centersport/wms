import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  IconButton,
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
import { Search as SearchIcon, CloudUpload, Refresh } from '@mui/icons-material';

import Layout from '../components/Layout';
import { buscarProdutos } from '../services/API'; // crie essa função no backend se ainda não tiver

const itemsPerPage = 50;

interface ProdutoLocal {
  produto_id: number;
  url_foto: string;
  descricao: string;
  sku: string;
  ean: string;
}

const Produto: React.FC = () => {
  const [listaProdutos, setListaProdutos] = useState<ProdutoLocal[]>([]);
  const [busca, setBusca] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderBy, setOrderBy] = useState<keyof ProdutoLocal>('descricao');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const carregarProdutos = async () => {
      try {
        const dados = await buscarProdutos();
        setListaProdutos(dados);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      }
    };

    carregarProdutos();
  }, []);

  console.log("teste")

  const filteredIndices = useMemo(() => {
    return listaProdutos.reduce<number[]>((acc, produto, idx) => {
      const termo = busca.toLowerCase().trim();
      const campos = [produto.descricao, produto.sku, produto.ean].filter(Boolean);

      if (
        termo === '' ||
        campos.some((campo) => campo.toLowerCase().includes(termo))
      ) {
        acc.push(idx);
      }
      return acc;
    }, []);
  }, [listaProdutos, busca]);

  const handleSort = (property: keyof ProdutoLocal) => {
    const isAsc = orderBy === property && orderDirection === 'asc';
    setOrderDirection(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const filteredItems = listaProdutos.filter((produto) => {
    const termo = busca.toLowerCase().trim();
    return (
      termo === '' ||
      [produto.descricao, produto.sku, produto.ean].some((campo) =>
        campo?.toLowerCase().includes(termo)
      )
    );
  });

  const sortedItems = filteredItems.sort((a, b) => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    const aStr = typeof aValue === 'string' ? aValue.toLowerCase() : aValue;
    const bStr = typeof bValue === 'string' ? bValue.toLowerCase() : bValue;

    if (aStr < bStr) return orderDirection === 'asc' ? -1 : 1;
    if (aStr > bStr) return orderDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedItems.slice(startIndex, endIndex);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedItems(checked ? currentItems.map((p) => p.produto_id) : []);
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    setSelectedItems((prev) =>
      checked ? [...prev, id] : prev.filter((pid) => pid !== id)
    );
  };

  return (
    <Layout totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Produtos
      </Typography>

      <Box display="flex" gap={2} mb={3} alignItems="center" flexWrap="wrap">
        <TextField
          placeholder="Buscar por nome, SKU ou EAN"
          variant="outlined"
          size="small"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ maxWidth: 480, width: 380 }}
        />

        <Button
          variant="contained"
          startIcon={<Refresh />}
          sx={{ backgroundColor: '#61de27', color: '#000', fontWeight: 'bold' }}
          onClick={() => alert('Atualizar Produtos (implementar função)')}
        >
          Atualizar Produtos
        </Button>

        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          sx={{ backgroundColor: '#61de27', color: '#000', fontWeight: 'bold' }}
          onClick={() => alert('Importar Produtos da Tiny (implementar função)')}
        >
          Importar Produtos Tiny
        </Button>
      </Box>

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

              <TableCell sx={{ fontWeight: 600 }}>Foto</TableCell>

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
            </TableRow>
          </TableHead>
          <TableBody>
            {currentItems.length ? (
              currentItems.map((produto, idx) => {
                const isSelected = selectedItems.includes(produto.produto_id);
                return (
                  <TableRow key={produto.produto_id} selected={isSelected} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => handleSelectItem(produto.produto_id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>
                      {produto.url_foto ? (
                        <img src={produto.url_foto} alt={produto.descricao} width={50} />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{produto.descricao}</TableCell>
                    <TableCell>{produto.sku}</TableCell>
                    <TableCell>{produto.ean}</TableCell>
                    {/* <TableCell>{produto.quantidade}</TableCell> */}
                  </TableRow>

                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Nenhum produto encontrado.
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

export default Produto;
