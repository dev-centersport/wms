import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Paper,
  Button,
} from '@mui/material';
import {
  buscarProdutosEsperadosDaOcorrencia,
  registrarConferenciaAuditoria,
} from '../services/API';

export default function ConferenciaAuditoria() {
  const { id } = useParams();
  const [esperados, setEsperados] = useState<any[]>([]);
  const [bipados, setBipados] = useState<Record<string, number>>({});

  useEffect(() => {
    async function carregarProdutos() {
      if (!id) return;
      try {
        const produtos = await buscarProdutosEsperadosDaOcorrencia(Number(id));
        setEsperados(produtos);
      } catch (err) {
        alert('Erro ao buscar produtos esperados para auditoria.');
      }
    }
    carregarProdutos();
  }, [id]);

  const handleBipagem = (ean: string) => {
    const produto = esperados.find((p) => p.ean === ean.trim());
    if (!produto) {
      alert('Produto não esperado nesta auditoria.');
      return;
    }
    setBipados((prev) => ({
      ...prev,
      [produto.sku]: (prev[produto.sku] || 0) + 1,
    }));
  };

  const handleSalvar = async () => {
    try {
      await registrarConferenciaAuditoria(Number(id), bipados);
      alert('Conferência registrada com sucesso.');
    } catch (err: any) {
      alert(`Erro ao salvar conferência: ${err?.response?.data?.message || err.message}`);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Conferência da Auditoria #{id}
      </Typography>

      <Box display="flex" gap={5} mt={3}>
        {/* Produtos Esperados */}
        <Box flex={1} component={Paper} p={2}>
          <Typography variant="h6">Produtos Esperados</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Qtd Esperada</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {esperados.map((p) => (
                <TableRow key={p.sku}>
                  <TableCell>{p.sku}</TableCell>
                  <TableCell>{p.descricao}</TableCell>
                  <TableCell>{p.quantidade}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        {/* Bipagem */}
        <Box flex={1} component={Paper} p={2}>
          <Typography variant="h6">Produtos Bipados</Typography>
          <TextField
            fullWidth
            placeholder="Bipe o EAN aqui"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleBipagem((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
          <Table size="small" sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Qtd Bipado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(bipados).map(([sku, qtd]) => (
                <TableRow key={sku}>
                  <TableCell>{sku}</TableCell>
                  <TableCell>{qtd}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button
            variant="contained"
            sx={{ mt: 2, backgroundColor: '#4CAF50', color: '#fff', fontWeight: 600 }}
            onClick={handleSalvar}
          >
            Salvar Conferência
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
