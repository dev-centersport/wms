// ConferenciaAuditoria.tsx
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
  buscarOcorrenciasDaLocalizacao,
  registrarConferenciaAuditoria,
  ItemAuditoriaPayload,
} from '../services/API';
import Layout from '../components/Layout';

interface ProdutoOcorrencia {
  produto_id: number;
  descricao: string;
  sku: string;
  qtd_esperada: number;
  qtd_ocorrencias: number;
  ean?: string;
  qtd_sistema?: number;
}

const ConferenciaAuditoria: React.FC = () => {
  const { id } = useParams();
  const [esperados, setEsperados] = useState<any[]>([]);
  const [bipados, setBipados] = useState<Record<string, number>>({});

  useEffect(() => {
    async function carregarProdutos() {
      if (!id) return;
      try {
        const dados = await buscarOcorrenciasDaLocalizacao(Number(id));
        const produtos = dados.flatMap((ocorrencia: any) => ocorrencia.produto || []);
        setEsperados(produtos);
      } catch (err) {
        alert('Erro ao buscar produtos da localização.');
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
      [produto.produto_id]: (prev[produto.produto_id] || 0) + 1,
    }));
  };

  const handleSalvar = async () => {
    const itens: ItemAuditoriaPayload[] = Object.entries(bipados).map(([produto_id, quantidade]) => {
      const produto = esperados.find(p => String(p.produto_id) === produto_id);
      return {
        produto_estoque_id: Number(produto_id),
        quantidade,
        quantidades_sistema: Number(produto?.qtd_sistema || 0),
        quantidades_fisico: quantidade,
        motivo_diferenca: 'Conferência Física',
        acao_corretiva: 'Ajuste realizado',
        estoque_anterior: Number(produto?.qtd_sistema || 0),
        estoque_novo: quantidade,
      };
    });

    try {
      await registrarConferenciaAuditoria(Number(id), 'Conferência concluída com sucesso.', itens);
      alert('Conferência registrada com sucesso.');
    } catch (err: any) {
      alert(`Erro ao salvar conferência: ${err?.response?.data?.message || err.message}`);
    }
  };

  return (
    <Layout show={false}>
      <Box p={3}>
        <Typography variant="h5" gutterBottom>
          Conferência da Auditoria #{id}
        </Typography>

        <Box display="flex" gap={5} mt={3}>
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
                {esperados.map((p, index) => (
                  <TableRow key={`${p.produto_id}-${index}`}>
                    <TableCell>{p.sku || '-'}</TableCell>
                    <TableCell>{p.descricao || '-'}</TableCell>
                    <TableCell>{p.qtd_esperada ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>

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
                {Object.entries(bipados).map(([produto_id, qtd]) => {
                  const produto = esperados.find((p) => String(p.produto_id) === produto_id);
                  return (
                    <TableRow key={produto_id}>
                      <TableCell>{produto?.sku || '-'}</TableCell>
                      <TableCell>{qtd}</TableCell>
                    </TableRow>
                  );
                })}
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
    </Layout>
  );
}

export default ConferenciaAuditoria;