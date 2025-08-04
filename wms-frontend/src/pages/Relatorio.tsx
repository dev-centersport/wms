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
import api from '../services/API';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Produto = {
  id_tiny: number;
  descricao: string;
  sku: string;
  ean: string;
};

type EstoqueItem = {
  produto: Produto;
  quantidade: number;
};

export default function Relatorio() {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [tipoArquivo, setTipoArquivo] = useState<'excel' | 'pdf'>('excel');

  const handleAbrirInventario = () => {
    setMostrarFiltros(prev => !prev);
  };

  const handleAuditoria = () => {};
  const handleReposicao = () => {};

  const handleGerarRelatorio = async () => {
    try {
      const response = await api.get('/produto-estoque/relatorio');
      const dados = Array.isArray(response.data) ? response.data : response.data?.data || [];

      const formatados = dados.map((item: any) => ({
        Armazém: item.localizacao?.armazem || '',
        Localizacao: item.localizacao?.nome || '',
        Tipo: item.localizacao?.tipo || '',
        SKU: item.produto?.sku || '',
        Descrição: item.produto?.descricao || '',
        EAN: item.produto?.ean || '',
        Quantidade: item.quantidade || 0,
      }));

      if (!formatados.length) {
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
          body: formatados.map((item: Record<string, any>) => Object.values(item)),
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
    const response = await api.get('/produto-estoque/pesquisar?relatorio=true');
    const dados = Array.isArray(response.data?.results) ? response.data.results : [];

    const formatados = dados.map((item: any) => ({
      ID: item.produto?.id_tiny || '',
      Produto: item.produto?.descricao || '',
      'Código (SKU)': item.produto?.sku || '',
      'GTIN/EAN': item.produto?.ean || '',
      Localização: item.localizacao?.nome || '',
      'Saldo em estoque': typeof item.quantidade === 'number' ? item.quantidade : 0
    }));

    if (formatados.length === 0) {
      alert('Nenhum dado encontrado para exportar.');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(formatados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventário WMS-Center');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    saveAs(blob, 'inventario-tiny-wms.xlsx');
    alert('Inventário WMS-Center exportado com sucesso!');
  } catch (err) {
    console.error('Erro ao gerar inventário Tiny:', err);
    alert('Erro ao gerar o inventário.');
  }
};





  return (
    <Layout>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>Relatórios</Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <RelatorioCard titulo="Relatório de Consulta" descricao="Download do inventário de estoque" onClick={handleAbrirInventario} />
        <RelatorioCard titulo="Relatório de Auditoria" descricao="Produtos em auditoria" onClick={handleAuditoria} />
        <RelatorioCard titulo="Relatório de Reposição" descricao="Ex: Produtos que tem em outros armazéns mas não tem na dib jorge" onClick={handleReposicao} color="red" />
        <RelatorioCard titulo="Gerar Inventário WMS-Center" descricao="Exportar inventário no padrão Tiny (ID, Produto, SKU, EAN...)" onClick={handleGerarInventarioTiny} />
      </Box>

      <Collapse in={mostrarFiltros} timeout="auto" unmountOnExit>
        <Box mt={4}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Filtros Inventário</Typography>
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <FiltroSelect label="Armazém" defaultValue="todos" />
            <FiltroSelect label="Localização" defaultValue="todos" />
            <FiltroSelect label="Situação dos Produtos" defaultValue="maior0" opcoes={[{ label: 'Saldo maior que 0', value: 'maior0' }, { label: 'Saldo > 1', value: 'maior1' }]} />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Formato</InputLabel>
              <Select value={tipoArquivo} label="Formato" onChange={(e) => setTipoArquivo(e.target.value as 'excel' | 'pdf')}>
                <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleGerarRelatorio} sx={{ backgroundColor: '#61de27', color: '#000', fontWeight: 'bold', height: 40 }}>
              Gerar
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Layout>
  );
}

const RelatorioCard = ({ titulo, descricao, onClick, color = 'text.secondary' }: any) => (
  <Paper elevation={3} sx={{ p: 2, borderLeft: '6px solid #61de27', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', '&:hover': { boxShadow: 4 } }} onClick={onClick}>
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{titulo}</Typography>
      <Typography variant="body2" sx={{ color }}>{descricao}</Typography>
    </Box>
    <IconButton><ArrowForwardIosIcon /></IconButton>
  </Paper>
);

const FiltroSelect = ({ label, defaultValue, opcoes = [{ label: 'Todos', value: 'todos' }] }: any) => (
  <FormControl size="small" sx={{ minWidth: 160 }}>
    <InputLabel>{label}</InputLabel>
    <Select defaultValue={defaultValue} label={label}>
      {opcoes.map((opt: any) => (
        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
      ))}
    </Select>
  </FormControl>
);