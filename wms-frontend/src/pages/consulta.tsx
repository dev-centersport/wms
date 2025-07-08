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
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

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

const Consulta: React.FC = () => {
  const [lista, setLista] = useState<ConsultaEstoque[]>([]);
  const [busca, setBusca] = useState('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

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

  const filteredIndices = useMemo(() => {
    return lista.reduce<number[]>((acc, item, idx) => {
      const termo = busca.toLowerCase().trim();
      const campos = [item.descricao, item.sku, item.ean, item.armazem, item.localizacao].filter(Boolean);

      if (
        termo === '' ||
        campos.some((campo) => campo.toLowerCase().includes(termo))
      ) {
        acc.push(idx);
      }
      return acc;
    }, []);
  }, [lista, busca]);

  const totalPages = Math.ceil(filteredIndices.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentIndices = filteredIndices.slice(startIndex, endIndex);
  const currentItems = currentIndices.map((i) => lista[i]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedItems(checked ? currentIndices : []);
  };

  const handleSelectItem = (originalIndex: number, checked: boolean) => {
    setSelectedItems((prev) =>
      checked ? [...prev, originalIndex] : prev.filter((idx) => idx !== originalIndex)
    );
  };

  return (
    <Layout totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Consulta
      </Typography>

      <Box display="flex" gap={2} mb={3} alignItems="center" flexWrap="wrap">
        <TextField
          placeholder="Busca por nome, SKU ou EAN"
          variant="outlined"
          size="small"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ maxWidth: 480, width: 380 }}
        />
        <Button variant="outlined" sx={{ height: 40 }}>
          Filtro
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, maxHeight: 600, overflow: 'auto' }}>
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
                  <TableRow key={originalIndex} selected={isSelected} hover>
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
