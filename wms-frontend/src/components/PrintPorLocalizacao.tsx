import React from 'react';
import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Box, Paper } from '@mui/material';

interface PrintPorLocalizacaoProps {
  data: {
    localizacoes: {
      armazem: { armazemID: number; armazem: string; }[];
      localizacao: string;
      produtoSKU: string;
      quantidadeSeparada: number;
      pedidosAtendidos: { pedidoId: string; numeroPedido: string }[];
    }[];
    produtosNaoEncontrados?: string[];
  };
}

const PrintPorLocalizacao: React.FC<PrintPorLocalizacaoProps> = ({ data }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Impressão por Localização
      </Typography>
      {data.localizacoes?.length ? (
        <Table size="small" sx={{ mb: 3 }}>
          <TableHead>
            <TableRow>
              <TableCell>Armazém</TableCell>
              <TableCell>Localização</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Qtd Separada</TableCell>
              <TableCell>Pedidos Atendidos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.localizacoes.map((loc, idx) => (
              <TableRow key={`${loc.localizacao}-${loc.produtoSKU}`}>
                <TableCell>{loc.armazem?.map(a => a.armazem).join(', ')}</TableCell>
                <TableCell>{loc.localizacao}</TableCell>
                <TableCell>{loc.produtoSKU}</TableCell>
                <TableCell>{loc.quantidadeSeparada}</TableCell>
                <TableCell>
                  {loc.pedidosAtendidos.map(pa => pa.numeroPedido).join(', ')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <Typography>Nenhuma localização encontrada.</Typography>
      )}

      {Array.isArray(data.produtosNaoEncontrados) && data.produtosNaoEncontrados.length > 0 && (
        <Paper sx={{ mt: 3, p: 2, backgroundColor: '#ffeaea' }}>
            <Typography sx={{ fontWeight: 600 }}>Produtos Não Encontrados:</Typography>
            <ul>
            {data.produtosNaoEncontrados.map((item, idx) => (
                <li key={idx}>{item}</li>
            ))}
            </ul>
        </Paper>
        )}
    </Box>
  );
};

export default PrintPorLocalizacao;
