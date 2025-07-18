import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Button, MenuItem, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TextField, IconButton, Tooltip,
  Checkbox
} from '@mui/material';
import { CloudUpload, Print, Close, Label } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import PrintPorPedido from '../components/PrintPorPedido';
import PrintPorLocalizacao from '../components/PrintPorLocalizacao';
import axios from 'axios';
import Layout from '../components/Layout';

interface ProdutoPlanilha {
  [key: string]: string | number;
}

const ENDPOINT_PEDIDO = 'http://151.243.0.78:3001/separacao/agrupado-pedido';
const ENDPOINT_SKU = 'http://151.243.0.78:3001/separacao/agrupado-sku';

const armazensExemplo = [
  { armazem_id: 1, nome: 'Dib Jorge' },
  { armazem_id: 2, nome: 'Central' },
];

const columns = [
  { key: "Número do pedido", label: "Número do Pedido" },
  { key: "Descrição", label: "Descrição" },
  { key: "Quantidade", label: "Quantidade" },
  { key: "Código (SKU)", label: "Código (SKU)" },
]

// Hook personalizado para impressão - CORRIGIDO
const usePrint = () => {
  const handlePrint = (contentRef: React.RefObject<HTMLDivElement>) => {
    if (!contentRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printStyles = `
      <style>
        @media print {
          body { 
            font-family: Arial, sans-serif; 
            font-size: 1pt !important;
            margin: 10px;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 4px;
            text-align: center;
            font-size: 8pt !important;
          }
          th {
            background-color: #f2f2f2 !important;
          }
          @page {
            size: A4;
            margin: 1cm;
          }
        }
      </style>
    `;

    printWindow.document.write(`
      <html>
        <head>
          <title>Documento para Impressão</title>
          ${printStyles}
        </head>
        <body>
          ${contentRef.current.innerHTML}
          <script>
            setTimeout(function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            }, 200);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return handlePrint;
};

export default function Separacao() {
  const [produtos, setProdutos] = useState<ProdutoPlanilha[]>([]);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [armazem, setArmazem] = useState('');
  const [armazemId, setArmazemId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [printTipo, setPrintTipo] = useState<'pedido' | 'localizacao' | null>(null);
  const [dadosImpressao, setDadosImpressao] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  const printRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>; // Remova a união com null aqui
  const handlePrint = usePrint();

  // Leitura do XLS para exibir tabela
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArquivo(file);
    
    const reader = new FileReader();
    reader.onload = (evt: any) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
      setProdutos(data as ProdutoPlanilha[]);
      setSelectedItems([]);
      setSelectAll(false);
    };
    reader.readAsBinaryString(file);
  };
  
  // Seleção do armazém
  const handleArmazemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nome = e.target.value;
    setArmazem(nome);
    const found = armazensExemplo.find(a => a.nome === nome);
    setArmazemId(found?.armazem_id || null);
  };
  
  // Seleção de itens na tabela
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedItems(checked ? [...Array(produtos.length).keys()] : []);
  };

  const handleSelectItem = (index: number, checked: boolean) => {
    setSelectedItems(prev => 
      checked ? [...prev, index] : prev.filter(i => i !== index)
    );
  };

  // Função para imprimir a separação
  const handleImprimirSeparacao = () => {
    if (!produtos.length) {
      alert('Nenhum produto carregado.');
      return;
    }
    
    const produtosParaImprimir = selectedItems.length > 0 
      ? selectedItems.map(index => produtos[index]) 
      : produtos;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dataAtual = new Date().toLocaleString('pt-BR');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Separação de Produtos</title>
        <style>
          @media print {
            body { 
              font-family: Arial, sans-serif; 
              margin: 10px;
              -webkit-print-color-adjust: exact;
            }
            .header { margin-bottom: 24px; }
            .header h2 { margin: 0; }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 0 auto;
              font-size: 15px;
            }
            th, td {
              border: 1px solid #888;
              padding: 6px 12px;
              text-align: left;
            }
            th {
              background: #f0f0f0 !important;
            }
            @page {
              size: auto;
              margin: 5mm;
            }
          }
          body { font-family: Arial, sans-serif; margin: 18px; }
          .header { margin-bottom: 24px; }
          .header h2 { margin: 0; }
          .info { margin: 8px 0 20px 0; font-size: 14px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Separação de Produtos</h2>
          <div class="info">
            Armazém: <b>${armazem || '-'}</b> <br/>
            Data: ${dataAtual}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              ${produtosParaImprimir.length > 0 ? Object.keys(produtosParaImprimir[0]).map(key => `<th>${key}</th>`).join('') : ''}
            </tr>
          </thead>
          <tbody>
            ${produtosParaImprimir.map(prod => `
              <tr>
                ${Object.values(prod).map(val => `<td>${val}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <script>
          setTimeout(function() {
            window.print();
            window.onafterprint = function() { window.close(); }
          }, 200);
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  // Requisição para endpoints de impressão
  const handleImprimir = async (tipo: 'pedido' | 'localizacao') => {
    if (!arquivo) {
      alert('Faça upload do arquivo.');
      return;
    }
    setLoading(true);
    setPrintTipo(null);
    setDadosImpressao(null);
    
    const form = new FormData();
    form.append('arquivo', arquivo);
    // form.append('armazemPrioritarioId', String(armazemId));
    
    try {
      const url = tipo === 'pedido' ? ENDPOINT_PEDIDO : ENDPOINT_SKU;
      console.log(url)
      const { data } = await axios.post(url, form);
      console.log(data)
      setDadosImpressao(data);
      setPrintTipo(tipo);
    } catch (err) {
      console.log(err)
      alert('Erro ao gerar dados para impressão.');
    } finally {
      setLoading(false);
    }
  };

  // Limpar seleção
  const handleLimparSelecao = () => {
    setSelectedItems([]);
    setSelectAll(false);
  };

  return (
    <Layout>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Separação de Produtos
      </Typography>

      <Box display="flex" alignItems="center" gap={2} mb={3} flexWrap="wrap">
        <Button
          variant="contained"
          component="label"
          startIcon={<CloudUpload />}
          sx={{ backgroundColor: '#61de27', color: '#000', fontWeight: 'bold' }}
        >
          Selecionar Arquivo
          <input type="file" hidden onChange={handleUpload} accept=".xls,.xlsx" />
        </Button>
        {arquivo && (
          <Typography variant="body2">{arquivo.name}</Typography>
        )}
        {/* <TextField
          select
          label="Escolha o Armazém"
          value={armazem}
          onChange={handleArmazemChange}
          sx={{ minWidth: 220 }}
          size="small"
        >
          <MenuItem value="">-- Armazém --</MenuItem>
          {armazensExemplo.map((a) => (
            <MenuItem key={a.armazem_id} value={a.nome}>
              {a.nome}
            </MenuItem>
          ))}
        </TextField> */}

        {selectedItems.length > 0 && (
          <Tooltip title="Limpar seleção">
            <Button
              variant="outlined"
              onClick={handleLimparSelecao}
              sx={{ ml: 1 }}
            >
              Limpar Seleção
            </Button>
          </Tooltip>
        )}
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 2, maxHeight: 450, overflow: 'auto', mb: 3 }}>
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
              {columns.map((col) => (
                <TableCell key={col.key} sx={{ fontWeight: 600 }}>{col.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {produtos.length > 0 ? (
              produtos.map((p, idx) => (
                <TableRow key={idx} selected={selectedItems.includes(idx)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedItems.includes(idx)}
                      onChange={(e) => handleSelectItem(idx, e.target.checked)}
                    />
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={`${idx}-${col.key}`}>
                      {p[col.key] !== undefined ? p[col.key] : '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} align="center">
                  Nenhum produto carregado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <Button
          variant="contained"
          color="success"
          startIcon={<Print />}
          onClick={() => handleImprimir('pedido')}
          disabled={loading || produtos.length === 0}
          sx={{ fontWeight: 'bold' }}
        >
          Imprimir por Pedido
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<Print />}
          onClick={() => handleImprimir('localizacao')}
          disabled={loading || produtos.length === 0}
          sx={{ fontWeight: 'bold' }}
        >
          Imprimir por Localização
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Print />}
          onClick={handleImprimirSeparacao}
          disabled={produtos.length === 0}
          sx={{ fontWeight: 'bold' }}
        >
          {selectedItems.length > 0 ? 'Imprimir Selecionados' : 'Imprimir Separação'}
        </Button>
      </Box>

      {/* Bloco de impressão */}
      {printTipo && dadosImpressao && (
        <Paper sx={{ p: 3, position: 'relative', mt: 3 }}>
          <IconButton
            onClick={() => setPrintTipo(null)}
            sx={{ position: 'absolute', right: 12, top: 12 }}
          >
            <Close />
          </IconButton>
          
          <Button 
            variant="outlined" 
            startIcon={<Print />}
            onClick={() => handlePrint(printRef)}
            sx={{ mb: 2 }}
          >
            Imprimir esta seção
          </Button>
          
          <div ref={printRef}>
            {printTipo === 'pedido' ? (
              <PrintPorPedido data={dadosImpressao} />
            ) : (
              <PrintPorLocalizacao data={dadosImpressao} />
            )}
          </div>
        </Paper>
      )}
    </Layout>
  );
}