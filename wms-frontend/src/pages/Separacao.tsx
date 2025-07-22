// Separacao.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Tooltip, Checkbox
} from '@mui/material';
import { CloudUpload, Print, Close, PictureAsPdf } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import PrintPorPedido from '../components/PrintPorPedido';
import PrintPorLocalizacao from '../components/PrintPorLocalizacao';
import axios from 'axios';
import Layout from '../components/Layout';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ProdutoPlanilha {
  [key: string]: string | number;
}

const ENDPOINT_PEDIDO = 'http://151.243.0.78:3001/separacao/agrupado-pedido';
const ENDPOINT_SKU = 'http://151.243.0.78:3001/separacao/agrupado-sku';

const columns = [
  { key: "Número do pedido", label: "Número do Pedido" },
  { key: "Descrição", label: "Descrição" },
  { key: "Quantidade", label: "Quantidade" },
  { key: "Código (SKU)", label: "Código (SKU)" },
];

export default function Separacao() {
  const [produtos, setProdutos] = useState<ProdutoPlanilha[]>([]);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [printTipo, setPrintTipo] = useState<'pedido' | 'localizacao' | null>(null);
  const [dadosImpressao, setDadosImpressao] = useState<any>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const printRef = useRef<HTMLDivElement | null>(null);

const imprimirDireto = () => {
  const content = printRef.current;
  if (!content) return;

  const printWindow = window.open('', '', 'width=1000,height=700');
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>Relatório de Separação</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          img { max-height: 100px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ccc; padding: 6px; text-align: left; font-size: 12px; }
          .barcode { margin-top: 4px; }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      </head>
      <body>
        ${content.innerHTML}
        <script>
          window.onload = function () {
            const svgs = document.querySelectorAll('svg[data-barcode]');
            svgs.forEach(svg => {
              const value = svg.getAttribute('data-barcode');
              if (value) {
                JsBarcode(svg, value, { format: "EAN13", displayValue: true, fontSize: 14, height: 40 });
              }
            });
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
};


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

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedItems(checked ? [...Array(produtos.length).keys()] : []);
  };

  const handleSelectItem = (index: number, checked: boolean) => {
    setSelectedItems(prev =>
      checked ? [...prev, index] : prev.filter(i => i !== index)
    );
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

      let dadosCorrigidos;

      if (tipo === 'pedido') {
        dadosCorrigidos = {
          ...data,
          pedidos: data.pedidos.map((pedido: any) => ({
            ...pedido,
            itens: pedido.itens.map((item: any) => ({
              ...item,
              urlFoto: item.urlFoto || item.url_foto || ''
            }))
          }))
        };
      } else {
        dadosCorrigidos = {
        localizacoes: data.localizacoes.map((loc: any) => ({
          armazem: loc.armazem,
          localizacao: loc.localizacao,
          produtoSKU: loc.sku ?? '',
          produtoDescricao: loc.descricao ?? '',
          produtoEAN: loc.ean ?? '',
          produtoFoto: loc.url_foto ?? '',
          quantidadeSeparada: loc.quantidadeSeparada ?? 0
        }))
      };



      }

      setDadosImpressao(dadosCorrigidos);
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
        {arquivo && <Typography variant="body2">{arquivo.name}</Typography>}

        {selectedItems.length > 0 && (
          <Tooltip title="Limpar seleção">
            <Button variant="outlined" onClick={handleLimparSelecao} sx={{ ml: 1 }}>
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
      </Box>

      {printTipo && dadosImpressao && (
        <Paper sx={{ p: 3, position: 'relative', mt: 3 }}>
          <IconButton onClick={() => setPrintTipo(null)} sx={{ position: 'absolute', right: 12, top: 12 }}>
            <Close />
          </IconButton>

          <Box display="flex" gap={2} mb={2}>
            <Button
              variant="outlined"
              startIcon={<Print />}
              onClick={imprimirDireto}
            >
              Imprimir Relatório
            </Button>

          </Box>

          <div ref={printRef} id="relatorio-impressao">
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
