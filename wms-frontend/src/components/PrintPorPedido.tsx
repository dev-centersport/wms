import React from 'react';
import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Box } from '@mui/material';

interface PrintPorPedidoProps {
  data: {
    pedidos: {
      numeroPedido: string;
      completo: boolean;
      itens: {
        sku: string;
        idItem: string;
        localizacoes: {
          armazem: {
            armazemID: number;
            armazem: string;
          };
          localizacao: string;
          quantidadeSeparada: number;
        }[];
      }[];
    }[];
  };
}

const PrintPorPedido: React.FC<PrintPorPedidoProps> = ({ data }) => {
  if (!data?.pedidos?.length) return <Typography>Nenhum pedido encontrado.</Typography>;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Impressão por Pedido
      </Typography>
      {data.pedidos.map((pedido, idx) => (
        <Box key={pedido.numeroPedido} sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Pedido: {pedido.numeroPedido} {pedido.completo ? '(Completo)' : '(Incompleto)'}
          </Typography>
          <Table size="small" sx={{ mt: 1, mb: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>ID Item</TableCell>
                <TableCell>Armazém</TableCell>
                <TableCell>Localização</TableCell>
                <TableCell>Qtd Separada</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pedido.itens.map(item =>
                item.localizacoes.map((loc, idx2) => (
                  <TableRow key={`${item.idItem}-${idx2}`}>
                    <TableCell>{item.sku}</TableCell>
                    <TableCell>{item.idItem}</TableCell>
                    <TableCell>{loc.armazem.armazem}</TableCell>
                    <TableCell>{loc.localizacao}</TableCell>
                    <TableCell>{loc.quantidadeSeparada}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      ))}
    </Box>
  );
};

export default PrintPorPedido;
