import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Box, Button, MenuItem, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TextField, IconButton, Tooltip,
  Checkbox
} from '@mui/material';
import { CloudUpload, Print, Close } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { pdf } from '@react-pdf/renderer';
import Layout from '../components/Layout';
import PdfPorPedido from '../components/PdfPorPedido';
import PdfPorLocalizacao from '../components/PdfPorLocalizacao';

// ==================== TIPOS ====================
interface ProdutoPlanilha {
  [key: string]: string | number;
}

interface Armazem {
  armazem_id: number;
  nome: string;
}

interface ColunaTabela {
  key: string;
  label: string;
}

type PrintTipo = 'pedido' | 'localizacao' | null;

interface DadosImpressaoPedido {
  pedidos: {
    numeroPedido: string;
    completo: boolean;
    itens: {
      ean: string;
      sku: string;
      idItem: string;
      descricao: string;
      urlFoto: string;
      localizacoes: {
        armazem: { armazemID: number; armazem: string };
        localizacao: string;
        quantidadeSeparada: number;
      }[];
    }[];
  }[];
  produtosNaoEncontrados: string[];
}

interface DadosImpressaoLocalizacao {
  localizacoes: {
    armazem: { armazemID: number; armazem: string }[];
    localizacao: string;
    produtoSKU: string;
    quantidadeSeparada: number;
    pedidosAtendidos: { pedidoId: string; numeroPedido: string }[];
  }[];
  produtosNaoEncontrados?: string[];
}

// ==================== CONSTANTES ====================
const ENDPOINT_PEDIDO = 'http://localhost:3001/separacao/agrupado-pedido';
const ENDPOINT_SKU = 'http://localhost:3001/separacao/agrupado-sku';

const ARMAZENS_EXEMPLO: Armazem[] = [
  { armazem_id: 1, nome: 'Dib Jorge' },
  { armazem_id: 2, nome: 'Central' },
];

const COLUNAS_TABELA: ColunaTabela[] = [
  { key: "Número do pedido", label: "Número do Pedido" },
  { key: "Descrição", label: "Descrição" },
  { key: "Quantidade", label: "Quantidade" },
  { key: "Código (SKU)", label: "Código (SKU)" },
];



// ==================== HOOK PERSONALIZADO PARA IMPRESSÃO ====================
const usePrint = () => {
  const handlePrint = useCallback((contentRef: React.RefObject<HTMLDivElement>) => {
    if (!contentRef.current) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printStyles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          return '';
        }
      })
      .join('\n');

    printWindow.document.write(`
      <html>
        <head>
          <title>Documento para Impressão</title>
          <style>
            ${printStyles}
            @page {
              size: auto;
              margin: 5mm;
            }
            @media print {
              body { 
                font-family: Arial, sans-serif; 
                margin: 0;
                padding: 0;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 4px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
              }
            }
          </style>
        </head>
        <body>
          ${contentRef.current.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Delay print to ensure content is loaded
    setTimeout(() => {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    }, 500);
  }, []);

  return handlePrint;
};
// ==================== COMPONENTE PRINCIPAL ====================
const Separacao: React.FC = () => {
  // Estados
  const [produtos, setProdutos] = useState<ProdutoPlanilha[]>([]);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [armazem, setArmazem] = useState<string>('');
  const [armazemId, setArmazemId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [printTipo, setPrintTipo] = useState<PrintTipo>(null);
  const [dadosImpressao, setDadosImpressao] = useState<DadosImpressaoPedido | DadosImpressaoLocalizacao | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  
  const printRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>; 
  const handlePrint = usePrint();

  // ==================== HANDLERS ====================
  const handleAbrirPdf = async (tipo: 'pedido' | 'localizacao', data: any) => {
    const doc = tipo === 'pedido'
      ? <PdfPorPedido data={data} />
      : <PdfPorLocalizacao data={data} />;
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setArquivo(file);
    const reader = new FileReader();
    
    reader.onload = (evt: ProgressEvent<FileReader>) => {
      try {
        const bstr = evt.target?.result as string;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' });
        setProdutos(data as ProdutoPlanilha[]);
        setSelectedItems([]);
        setSelectAll(false);
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        alert('Erro ao ler o arquivo. Verifique o formato.');
      }
    };
    
    reader.onerror = () => {
      alert('Erro ao ler o arquivo.');
    };
    
    reader.readAsBinaryString(file);
  };

  const handleArmazemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nome = e.target.value;
    setArmazem(nome);
    const found = ARMAZENS_EXEMPLO.find(a => a.nome === nome);
    setArmazemId(found?.armazem_id || null);
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedItems(checked ? [...Array(produtos.length).keys()] : []);
  };

  const handleSelectItem = (index: number, checked: boolean) => {
    setSelectedItems(prev => 
      checked ? [...prev, index] : prev.filter(i => i !== index)
    );
  };

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
    const headers = produtosParaImprimir.length > 0 ? Object.keys(produtosParaImprimir[0]) : [];

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Separação de Produtos</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 10px; }
          .header { margin-bottom: 20px; }
          .header h2 { margin: 0; }
          .info { margin: 8px 0 20px 0; font-size: 14px; color: #666; }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          @media print {
            body { margin: 0; padding: 0; }
            @page {
              size: auto;
              margin: 5mm;
            }
          }
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
              ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${produtosParaImprimir.map(prod => `
              <tr>
                ${headers.map(header => `<td>${prod[header] || '-'}</td>`).join('')}
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
    
    try {
      const url = tipo === 'pedido' ? ENDPOINT_PEDIDO : ENDPOINT_SKU;
      const { data } = await axios.post(url, form);
      
      // Validate the response data structure based on type
      if (tipo === 'pedido') {
        if (!data.pedidos) throw new Error('Resposta inválida: falta propriedade "pedidos"');
        setDadosImpressao(data as DadosImpressaoPedido);
      } else {
        if (!data.localizacoes) throw new Error('Resposta inválida: falta propriedade "localizacoes"');
        setDadosImpressao(data as DadosImpressaoLocalizacao);
      }
      
      setPrintTipo(tipo);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar dados para impressão.');
    } finally {
      setLoading(false);
    }
  };
  const handleLimparSelecao = () => {
    setSelectedItems([]);
    setSelectAll(false);
  };

  // ==================== RENDER ====================
  return (
    <Layout>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
        Separação de Produtos
      </Typography>

      {/* Seção de upload e controles */}
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

      {/* Tabela de produtos */}
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
              {COLUNAS_TABELA.map((col) => (
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
                  {COLUNAS_TABELA.map((col) => (
                    <TableCell key={`${idx}-${col.key}`}>
                      {p[col.key] !== undefined ? p[col.key] : '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={COLUNAS_TABELA.length + 1} align="center">
                  Nenhum produto carregado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Botões de ação */}
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

      {/* Seção de impressão */}
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
            sx={{ mb: 2, mr: 1 }}
            onClick={() => handleAbrirPdf(printTipo, dadosImpressao)}
          >
            Abrir PDF
          </Button>

          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={() => handlePrint(printRef)}
            sx={{ mb: 2 }}
          >
            Imprimir esta seção (HTML)
          </Button>

          <div ref={printRef}>
            {printTipo === 'pedido' && dadosImpressao && 'pedidos' in dadosImpressao && (
              <PdfPorPedido data={dadosImpressao} />
            )}
            {printTipo === 'localizacao' && dadosImpressao && 'localizacoes' in dadosImpressao && (
              <PdfPorLocalizacao data={dadosImpressao} />
            )}
          </div>
        </Paper>
      )}
    </Layout>
  );
};

export default Separacao;