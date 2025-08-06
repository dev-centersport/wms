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

      console.log('Iniciando geração do relatório...');
      
      const response = await api.get('/produto-estoque/relatorio');
      console.log('Resposta do relatório:', response);

      const dados = Array.isArray(response.data) ? response.data : response.data?.data || [];
      console.log('Dados formatados:', dados);

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
    } catch (err: any) {
      console.error('Erro ao gerar relatório:', err);
      
      // Verifica se é erro de autenticação
      if (err.response?.status === 401) {
        alert('Sessão expirada. Faça login novamente.');
        window.location.href = '/login';
        return;
      }
      
      // Verifica se é erro de rede
      if (err.code === 'NETWORK_ERROR' || err.code === 'ERR_NETWORK') {
        alert('Erro de conexão. Verifique sua internet.');
        return;
      }
      
      // Outros erros
      alert(`Falha ao gerar o relatório: ${err.response?.data?.message || err.message || 'Erro desconhecido'}`);
    }
  };

const handleGerarInventarioTiny = async () => {
  try {

    console.log('Iniciando geração do inventário Tiny...');
    
    const response = await api.get('/produto-estoque/relatorio');
    console.log('Resposta do inventário Tiny:', response);
    
    const dados = Array.isArray(response.data) ? response.data : [];
    console.log('Dados do inventário Tiny:', dados);

    const formatados = dados.map((item: any) => {
      // Debug: verificar estrutura dos dados
      console.log('Item original:', item);
      console.log('Quantidade:', item.quantidade);
      console.log('Localização:', item.localizacao);
      
      // Lógica corrigida: se quantidade é 0, localização deve ser vazia
      const localizacao = (item.quantidade === 0 || item.quantidade === '0') ? '' : (item.localizacao?.nome || '');
      
      return {
        ID: item.produto?.id_tiny || '',
        Produto: item.produto?.descricao || '',
        'Código (SKU)': item.produto?.sku || '',
        'GTIN/EAN': item.produto?.ean || '',
        Localização: localizacao,
        'Saldo em estoque': typeof item.quantidade === 'number' ? item.quantidade : 0
      };
    });

    console.log('Dados formatados para CSV:', formatados.slice(0, 5)); // Log dos primeiros 5 itens
    console.log('Total de itens formatados:', formatados.length);
    console.log('Itens com localização vazia:', formatados.filter(item => !item.Localização).length);
    console.log('Itens com saldo 0:', formatados.filter(item => item['Saldo em estoque'] === 0).length);


    if (formatados.length === 0) {
      alert('Nenhum dado encontrado para exportar.');
      return;
    }

    // Gerar CSV
    const headers = Object.keys(formatados[0]);
    const csvContent = [
      headers.join(','), // Cabeçalho
      ...formatados.map((row: Record<string, any>) => 
        headers.map(header => {
          const value = row[header];
          // Escapar vírgulas e aspas no valor
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Criar blob com encoding UTF-8
    const blob = new Blob(['\ufeff' + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });

    saveAs(blob, 'inventario-tiny-wms.csv');
    alert('Inventário WMS-Center exportado em CSV com sucesso!');
  } catch (err: any) {
    console.error('Erro ao gerar inventário Tiny:', err);
    
    // Verifica se é erro de autenticação
    if (err.response?.status === 401) {
      alert('Sessão expirada. Faça login novamente.');
      window.location.href = '/login';
      return;
    }
    
    // Verifica se é erro de rede
    if (err.code === 'NETWORK_ERROR' || err.code === 'ERR_NETWORK') {
      alert('Erro de conexão. Verifique sua internet.');
      return;
    }
    
    // Outros erros
    alert(`Erro ao gerar o inventário: ${err.response?.data?.message || err.message || 'Erro desconhecido'}`);
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