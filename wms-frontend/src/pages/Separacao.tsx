import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Input,
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
} from '@mui/material';
import { CloudUpload, Print, Cancel } from '@mui/icons-material';

import Layout from '../components/Layout';
import { buscarArmazem, buscarConsultaEstoque } from '../services/API';

interface ProdutoSeparacao {
  produto_id: number;
  descricao: string;
  sku: string;
  ean: string;
  armazem: string;
}

export default function Separacao() {
  const [armazens, setArmazens] = useState<{ armazem_id: number; nome: string }[]>([]);
  const [armazemSelecionado, setArmazemSelecionado] = useState('');
  const [produtos, setProdutos] = useState<ProdutoSeparacao[]>([]);
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null);

  useEffect(() => {
    async function carregarArmazens() {
      const lista = await buscarArmazem();
      setArmazens(lista);
    }
    carregarArmazens();
  }, []);

  const handleBuscarProdutos = async () => {
    const consulta = await buscarConsultaEstoque();
    const filtrados = consulta.filter((p: ProdutoSeparacao) => p.armazem === armazemSelecionado);
    setProdutos(filtrados);
  };

  const toggleSelecionado = (id: number) => {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const todosIds = produtos.map((p) => p.produto_id);
      setSelecionados(todosIds);
    } else {
      setSelecionados([]);
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArquivoSelecionado(file);
    }
  };

  return (
    <Layout>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Separação de Produtos
      </Typography>

      <Box display="flex" alignItems="center" gap={2} mb={3} flexWrap="wrap">
        {/* Upload Planilha */}
        <Box display="flex" alignItems="center" gap={2}>
  <Button
    variant="contained"
    component="label"
    startIcon={<CloudUpload />}
    sx={{ backgroundColor: '#61de27', color: '#000', fontWeight: 'bold' }}
  >
    Selecionar Arquivo
    <input type="file" hidden onChange={handleUpload} />
  </Button>

  {arquivoSelecionado && (
    <Typography variant="body2" color="textSecondary">
      {arquivoSelecionado.name}
    </Typography>
  )}
</Box>


        {/* Armazém Dropdown */}
        <TextField
          select
          label="Escolha o Armazém"
          value={armazemSelecionado}
          onChange={(e) => setArmazemSelecionado(e.target.value)}
          sx={{ minWidth: 220 }}
          size="small"
        >
          <MenuItem value="">-- Armazém --</MenuItem>
          {armazens.map((a) => (
            <MenuItem key={a.armazem_id} value={a.nome}>
              {a.nome}
            </MenuItem>
          ))}
        </TextField>

        <Button
          variant="contained"
          sx={{ backgroundColor: '#61de27', color: '#000', fontWeight: 'bold' }}
          onClick={handleBuscarProdutos}
        >
          Enviar
        </Button>
      </Box>

      {/* Tabela de produtos */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, maxHeight: 600, overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selecionados.length === produtos.length && produtos.length > 0}
                  indeterminate={selecionados.length > 0 && selecionados.length < produtos.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Descrição</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>EAN</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {produtos.length > 0 ? (
              produtos.map((p) => (
                <TableRow key={p.produto_id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selecionados.includes(p.produto_id)}
                      onChange={() => toggleSelecionado(p.produto_id)}
                    />
                  </TableCell>
                  <TableCell>{p.descricao}</TableCell>
                  <TableCell>{p.sku}</TableCell>
                  <TableCell>{p.ean}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  Nenhum produto para separação.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Ações de rodapé */}
      <Box display="flex" justifyContent="flex-start" mt={3} gap={2} flexWrap="wrap">
        <Button variant="contained" color="success" startIcon={<Print />}>
          Imprimir por Pedido
        </Button>
        <Button variant="contained" color="success" startIcon={<Print />}>
          Imprimir por Localização
        </Button>
        <Button variant="contained" color="inherit" startIcon={<Cancel />}>
          Cancelar
        </Button>
      </Box>
    </Layout>
  );
}
