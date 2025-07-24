import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Collapse,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Button
} from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Layout from '../components/Layout';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Relatorio() {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [tipoArquivo, setTipoArquivo] = useState<'excel' | 'pdf'>('excel');

  const handleAbrirInventario = () => {
    setMostrarFiltros((prev) => !prev);
  };

  const handleAuditoria = () => {
    // Navegar para página de auditoria
  };

  const handleReposicao = () => {
    // Navegar para página de reposição
  };

  const handleGerarRelatorio = async () => {
    try {
      const response = await axios.get('http://151.243.0.78:3001/produto-estoque/relatorio');
      const dados = response.data;

      const formatados = dados.map((item: any) => ({
        Armazém: item.localizacao.armazem,
        Localizacao: item.localizacao.nome,
        Tipo: item.localizacao.tipo,
        SKU: item.produto.sku,
        Descrição: item.produto.descricao,
        EAN: item.produto.ean,
        Quantidade: item.quantidade,
      }));

      if (formatados.length === 0) {
        alert('Nenhum dado encontrado.');
        return;
      }

      if (tipoArquivo === 'excel') {
        const ws = XLSX.utils.json_to_sheet(formatados);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, 'inventario.xlsx');
      } else {
        const doc = new jsPDF();
        autoTable(doc, {
          head: [Object.keys(formatados[0])],
          body: formatados.map((item: any) => Object.values(item)),
          styles: { fontSize: 7 },
          headStyles: { fillColor: [97, 222, 39] },
        });
        doc.save('inventario.pdf');
      }

      alert(`Relatório ${tipoArquivo === 'excel' ? 'Excel' : 'PDF'} gerado com sucesso!`);
    } catch (err) {
      console.error('Erro ao gerar relatório:', err);
      alert('Falha ao gerar o relatório.');
    }
  };

  const handleGerarInventarioTiny = async () => {
  try {
    const [produtosResp, estoqueResp] = await Promise.all([
      axios.get('http://151.243.0.78:3001/produto'),
      axios.get('http://151.243.0.78:3001/produto-estoque/relatorio')
    ]);

    const produtos = produtosResp.data;
    const estoque = estoqueResp.data;

    // Agrupa quantidade total por id_tiny
    const estoquePorProduto: Record<number, number> = {};
    estoque.forEach((item: any) => {
      const id = item.produto.id_tiny;
      if (!estoquePorProduto[id]) {
        estoquePorProduto[id] = 0;
      }
      estoquePorProduto[id] += item.quantidade || 0;
    });

    // Gera o array completo, mesmo com produtos sem estoque/localização
    const formatados = produtos.map((produto: any) => ({
      ID: produto.id_tiny,
      Produto: produto.descricao,
      'Código (SKU)': produto.sku,
      'GTIN/EAN': produto.ean,
      Localização: '',
      'Saldo em estoque': estoquePorProduto[produto.id_tiny] || 0
    }));

    // Geração do CSV com separador vírgula e codificação correta
    const csvHeader = Object.keys(formatados[0]).join(',') + '\n';
    const csvBody = formatados.map((row: any) => Object.values(row).join(',')).join('\n');
    const csvContent = '\uFEFF' + csvHeader + csvBody;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'inventario-tiny-wms.csv');

    alert('Inventário WMS-Center exportado com sucesso!');
  } catch (err) {
    console.error('Erro ao gerar inventário Tiny:', err);
    alert('Falha ao gerar o inventário WMS-Center.');
  }
};



  return (
    <Layout>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
        Relatórios
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        <Paper
          elevation={3}
          sx={{ p: 2, borderLeft: '6px solid #61de27', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
          onClick={handleAbrirInventario}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Relatório de Consulta
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Download do inventário de estoque
            </Typography>
          </Box>
          <IconButton>
            <ArrowForwardIosIcon />
          </IconButton>
        </Paper>

        <Paper
          elevation={3}
          sx={{ p: 2, borderLeft: '6px solid #61de27', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
          onClick={handleAuditoria}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Relatório de Auditoria
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Produtos em auditoria
            </Typography>
          </Box>
          <IconButton>
            <ArrowForwardIosIcon />
          </IconButton>
        </Paper>

        <Paper
          elevation={3}
          sx={{ p: 2, borderLeft: '6px solid #61de27', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
          onClick={handleReposicao}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Relatório de Reposição
            </Typography>
            <Typography variant="body2" sx={{ color: 'red' }}>
              Ex: Produtos que tem em outros armazéns mas não tem na dib jorge
            </Typography>
          </Box>
          <IconButton>
            <ArrowForwardIosIcon />
          </IconButton>
        </Paper>

        <Paper
          elevation={3}
          sx={{ p: 2, borderLeft: '6px solid #61de27', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', '&:hover': { boxShadow: 4 } }}
          onClick={handleGerarInventarioTiny}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Gerar Inventário WMS-Center
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Exportar inventário no padrão Tiny (ID, Produto, SKU, EAN...)
            </Typography>
          </Box>
          <IconButton>
            <ArrowForwardIosIcon />
          </IconButton>
        </Paper>
      </Box>

      <Collapse in={mostrarFiltros} timeout="auto" unmountOnExit>
        <Box mt={4}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Filtros Inventário
          </Typography>

          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Armazém</InputLabel>
              <Select defaultValue="todos" label="Armazém">
                <MenuItem value="todos">Todos</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Localização</InputLabel>
              <Select defaultValue="todos" label="Localização">
                <MenuItem value="todos">Todos</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Situação dos Produtos</InputLabel>
              <Select defaultValue="maior0" label="Situação dos Produtos">
                <MenuItem value="maior0">Saldo maior que 0</MenuItem>
                <MenuItem value="maior1">Saldo &gt; 1</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Formato</InputLabel>
              <Select
                value={tipoArquivo}
                label="Formato"
                onChange={(e) => setTipoArquivo(e.target.value as 'excel' | 'pdf')}
              >
                <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleGerarRelatorio}
              sx={{ backgroundColor: '#61de27', color: '#000', fontWeight: 'bold', height: 40 }}
            >
              Gerar
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Layout>
  );
}
