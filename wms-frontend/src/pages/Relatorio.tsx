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
import { BotaoComPermissao } from '../components/BotaoComPermissao';
import { usePermissao } from '../contexts/PermissaoContext';
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
  const { temPermissao } = usePermissao();
  const [mostrarFiltrosConsulta, setMostrarFiltrosConsulta] = useState(false);
  const [mostrarFiltrosReposicao, setMostrarFiltrosReposicao] = useState(false);
  const [tipoArquivoConsulta, setTipoArquivoConsulta] = useState<'excel' | 'pdf' | 'csv'>('excel');
  const [tipoArquivoReposicao, setTipoArquivoReposicao] = useState<'excel' | 'pdf' | 'csv'>('excel');

  const handleAbrirInventario = () => {
    if (!temPermissao('relatorio', 'incluir')) {
      alert('Você não tem permissão para gerar relatórios');
      return;
    }
    handleGerarRelatorio();
  };

  const handleAbrirConsulta = () => {
    if (!temPermissao('relatorio', 'incluir')) {
      alert('Você não tem permissão para gerar relatórios');
      return;
    }
    setMostrarFiltrosConsulta(prev => !prev);
  };

  const handleAbrirReposicao = () => {
    if (!temPermissao('relatorio', 'incluir')) {
      alert('Você não tem permissão para gerar relatórios');
      return;
    }
    setMostrarFiltrosReposicao(prev => !prev);
  };

  const handleAbrirAuditoria = () => {
    alert('Funcionalidade de auditoria em desenvolvimento!');
  };

  const handleGerarRelatorio = async () => {
    if (!temPermissao('relatorio', 'incluir')) {
      alert('Você não tem permissão para gerar relatórios');
      return;
    }
    
    try {

      console.log('Iniciando geração do relatório...');
      
      const response = await api.get('/relatorio/gerar-inventario');
      console.log('Resposta do relatório:', response);

      const dados = Array.isArray(response.data) ? response.data : [];
      console.log('Dados formatados:', dados);

              // Preparar dados para Excel XLS - forçar ID como texto
        const formatados = dados.map((item: any) => ({
          ID: String(item.produto?.id_tiny || ''), // Forçar como string para evitar notação científica
          Produto: item.produto?.descricao || '',
          'Código (SKU)': item.produto?.sku || '',
          'GTIN/EAN': item.produto?.ean || '',
          Localização: '',
          'Saldo em estoque': item.quantidade || 0,
        }));

      if (!formatados.length) {
        alert('Nenhum dado encontrado.');
        return;
      }

      // Gerar em formato XLS com formatação específica para ID
      const worksheet = XLSX.utils.json_to_sheet(formatados);
      
      // Forçar coluna ID como texto para evitar notação científica
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      for (let row = 1; row <= range.e.r; row++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: 0 }); // Coluna A (ID)
        if (worksheet[cellRef]) {
          worksheet[cellRef].t = 's'; // Forçar como string
          worksheet[cellRef].z = '@'; // Formato texto
        }
      }
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventário');
      
      // Gerar arquivo XLS (não XLSX)
      XLSX.writeFile(workbook, 'inventario_wms.xls', { bookType: 'xls' });
      
      console.log(`Total de registros processados: ${formatados.length}`);
      alert(`Relatório de Inventário XLS gerado com sucesso! ${formatados.length} registros`);
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



const handleGerarRelatorioConsulta = async () => {
  if (!temPermissao('relatorio', 'incluir')) {
    alert('Você não tem permissão para gerar relatórios');
    return;
  }
  
  try {
    console.log('Iniciando geração do relatório de consulta...');
    
    const response = await api.get('/relatorio/gerar-consulta');
    console.log('Resposta do relatório de consulta:', response);

    const dados = Array.isArray(response.data) ? response.data : [];
    console.log('Dados recebidos:', dados);

    // Filtrar dados undefined que vem do backend
    const dadosValidos = dados.filter((item: any) => item !== undefined && item !== null);
    
    if (!dadosValidos.length) {
      alert('Nenhum produto encontrado para consulta.');
      return;
    }

    // Formatar dados para o relatório de consulta (mostra cada localização separadamente)
    const formatados = dadosValidos.map((item: any) => ({
      'ID Produto': item.produto?.produto_id || '',
      'ID Tiny': item.produto?.id_tiny || '',
      SKU: item.produto?.sku || '',
      Produto: item.produto?.descricao || '',
      EAN: item.produto?.ean || '',
      Quantidade: item.quantidade || 0,
      Armazém: item.localizacao?.armazem || '',
      'ID Armazém': item.localizacao?.armazem_id || '',
      Localização: item.localizacao?.nome || '',
      'ID Localização': item.localizacao?.localizacao_id || '',
      'EAN Localização': item.localizacao?.ean || '',
      'Tipo Localização': item.localizacao?.tipo || '',
    }));

    console.log('Dados formatados:', formatados);

    if (!formatados.length) {
      alert('Nenhum dado válido encontrado.');
      return;
    }

    // Gerar arquivo baseado no tipo selecionado
    if (tipoArquivoConsulta === 'excel') {
      const ws = XLSX.utils.json_to_sheet(formatados);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Consulta');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'relatorio-consulta.xlsx');
    } else if (tipoArquivoConsulta === 'pdf') {
      const doc = new jsPDF({ orientation: 'landscape' });
      autoTable(doc, {
        head: [Object.keys(formatados[0])],
        body: formatados.map((item: Record<string, any>) => Object.values(item)),
        styles: { fontSize: 6 },
        headStyles: { fillColor: [97, 222, 39] },
      });
      doc.save('relatorio-consulta.pdf');
    } else if (tipoArquivoConsulta === 'csv') {
      const headers = Object.keys(formatados[0]);
      const csvContent = [
        headers.join(','),
        ...formatados.map((row: Record<string, any>) => 
          headers.map(header => {
            const value = row[header];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');
      
      const blob = new Blob(['\ufeff' + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });
      saveAs(blob, 'relatorio-consulta.csv');
    }

    alert(`Relatório de Consulta ${tipoArquivoConsulta === 'excel' ? 'Excel' : tipoArquivoConsulta === 'pdf' ? 'PDF' : 'CSV'} gerado com sucesso!`);
  } catch (err: any) {
    console.error('Erro ao gerar relatório de consulta:', err);
    
    if (err.response?.status === 401) {
      alert('Sessão expirada. Faça login novamente.');
      window.location.href = '/login';
      return;
    }
    
    if (err.code === 'NETWORK_ERROR' || err.code === 'ERR_NETWORK') {
      alert('Erro de conexão. Verifique sua internet.');
      return;
    }
    
    alert(`Falha ao gerar o relatório de consulta: ${err.response?.data?.message || err.message || 'Erro desconhecido'}`);
  }
};

const handleGerarRelatorioReposicao = async () => {
  if (!temPermissao('relatorio', 'incluir')) {
    alert('Você não tem permissão para gerar relatórios');
    return;
  }
  
  try {
    console.log('Iniciando geração do relatório de reposição...');
    
    const response = await api.get('/relatorio/gerar-reposicao');
    console.log('Resposta do relatório de reposição:', response);

    const dados = Array.isArray(response.data) ? response.data : [];
    console.log('Dados formatados:', dados);

    if (!dados.length) {
      alert('Nenhum produto para reposição encontrado.');
      return;
    }

    // Formatar dados para relatório de reposição
    const formatados: any[] = [];
    
    dados.forEach((item: any) => {
      item.armazens.forEach((armazem: any, index: number) => {
        formatados.push({
          SKU: item.produto.sku,
          Produto: item.produto.descricao,
          EAN: item.produto.ean || '',
          'ID Tiny': item.produto.id_tiny || '',
          Armazém: armazem.armazem_nome,
          'Quantidade Total': armazem.quantidade_total,
          'Total Armazéns': index === 0 ? item.total_armazens : '', // Só mostra no primeiro registro
          Localizações: armazem.localizacoes.map((loc: any) => `${loc.nome}(${loc.quantidade})`).join(', '),
        });
      });
    });

    // Gerar arquivo baseado no tipo selecionado
    if (tipoArquivoReposicao === 'excel') {
      const ws = XLSX.utils.json_to_sheet(formatados);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Reposição');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(blob, 'relatorio-reposicao.xlsx');
    } else if (tipoArquivoReposicao === 'pdf') {
      const doc = new jsPDF({ orientation: 'landscape' }); // Landscape para mais colunas
      autoTable(doc, {
        head: [Object.keys(formatados[0])],
        body: formatados.map((item: Record<string, any>) => Object.values(item)),
        styles: { fontSize: 6 },
        headStyles: { fillColor: [97, 222, 39] },
      });
      doc.save('relatorio-reposicao.pdf');
    } else if (tipoArquivoReposicao === 'csv') {
      const headers = Object.keys(formatados[0]);
      const csvContent = [
        headers.join(','),
        ...formatados.map((row: Record<string, any>) => 
          headers.map(header => {
            const value = row[header];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');
      
      const blob = new Blob(['\ufeff' + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });
      saveAs(blob, 'relatorio-reposicao.csv');
    }

    alert(`Relatório de Reposição ${tipoArquivoReposicao === 'excel' ? 'Excel' : tipoArquivoReposicao === 'pdf' ? 'PDF' : 'CSV'} gerado com sucesso!`);
  } catch (err: any) {
    console.error('Erro ao gerar relatório de reposição:', err);
    
    if (err.response?.status === 401) {
      alert('Sessão expirada. Faça login novamente.');
      window.location.href = '/login';
      return;
    }
    
    if (err.code === 'NETWORK_ERROR' || err.code === 'ERR_NETWORK') {
      alert('Erro de conexão. Verifique sua internet.');
      return;
    }
    
    alert(`Falha ao gerar o relatório de reposição: ${err.response?.data?.message || err.message || 'Erro desconhecido'}`);
  }
};

  return (
    <Layout>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>Relatórios</Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <RelatorioCard titulo="Relatório de Consulta" descricao="Produtos com estoque em localizações (somente com quantidade > 0)" onClick={handleAbrirConsulta} />
        <RelatorioCard titulo="Relatório de Auditoria" descricao="Produtos em auditoria (em desenvolvimento)" onClick={handleAbrirAuditoria} color="#9e9e9e" />
        <RelatorioCard titulo="Relatório de Reposição" descricao="Produtos que existem em múltiplos armazéns para reposição" onClick={handleAbrirReposicao} color="orange" />
        <RelatorioCard titulo="Relatório de Inventário" descricao="Download do inventário completo (todos os produtos)" onClick={handleAbrirInventario} />
      </Box>



      <Collapse in={mostrarFiltrosConsulta} timeout="auto" unmountOnExit>
        <Box mt={4}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Filtros Consulta</Typography>
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <FiltroSelect label="Armazém" defaultValue="todos" />
            <FiltroSelect label="Localização" defaultValue="todos" />
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Formato</InputLabel>
              <Select value={tipoArquivoConsulta} label="Formato" onChange={(e) => setTipoArquivoConsulta(e.target.value as 'excel' | 'pdf' | 'csv')}>
                <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>
                         <BotaoComPermissao
               modulo="relatorio"
               acao="incluir"
               onClick={handleGerarRelatorioConsulta}
               mensagemSemPermissao="Você não tem permissão para gerar relatórios"
               variant="contained"
               sx={{ backgroundColor: '#61de27', color: '#000', fontWeight: 'bold', height: 40 }}
             >
               Gerar
             </BotaoComPermissao>
          </Box>
        </Box>
      </Collapse>

      <Collapse in={mostrarFiltrosReposicao} timeout="auto" unmountOnExit>
        <Box mt={4}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Filtros Reposição</Typography>
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Formato</InputLabel>
              <Select value={tipoArquivoReposicao} label="Formato" onChange={(e) => setTipoArquivoReposicao(e.target.value as 'excel' | 'pdf' | 'csv')}>
                <MenuItem value="excel">Excel (.xlsx)</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>
                         <BotaoComPermissao
               modulo="relatorio"
               acao="incluir"
               onClick={handleGerarRelatorioReposicao}
               mensagemSemPermissao="Você não tem permissão para gerar relatórios"
               variant="contained"
               sx={{ backgroundColor: '#ff9800', color: '#fff', fontWeight: 'bold', height: 40 }}
             >
               Gerar
             </BotaoComPermissao>
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