import React from 'react';
import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Box, TableContainer, Paper, Tab } from '@mui/material';

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
    }[],
    produtosNaoEncontrados: string[];
  };
}

const PrintPorPedido: React.FC<PrintPorPedidoProps> = ({ data }) => {
  if (!data?.pedidos?.length) return <Typography>Nenhum pedido encontrado.</Typography>;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
        Impressão por Pedido
      </Typography>
      
      <TableContainer component={Paper} sx={{ borderRadius: 2, maxHeight: 450, overflow: 'auto', mb: 3 }}>
          <Box sx={{ mb: 2 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align='center'>Produto</TableCell>
                    {/* <TableCell align='center'>ID Produto</TableCell> */}
                    <TableCell align='center'>SKU / EAN</TableCell>
                    <TableCell align='center'>Qtd a Separar</TableCell>
                    <TableCell align='center'>Localização/Armazém</TableCell>
                    {/* <TableCell>Localização</TableCell> */}
                    <TableCell align='center'>Pedido Completo</TableCell>
                    <TableCell align='center'>Anotações</TableCell>
                  </TableRow>
                </TableHead>
              {data.pedidos.map((pedido, idx) => (
                <>
                  <TableBody>
                    {pedido.itens.map(item =>
                      item.localizacoes.map((loc, idx2) => (
                        <TableRow key={`${item.idItem}-${idx2}`}>
                          <TableCell align='center'>imagem produto</TableCell>
                          {/* <TableCell align='center'>{item.idItem}</TableCell> */}
                          <TableCell align='center'>{item.sku} <p></p> EAN</TableCell>
                          <TableCell align='center'>{loc.quantidadeSeparada}</TableCell>
                          <TableCell align='center'>{loc.localizacao} - {loc.armazem.armazem}</TableCell>
                          <TableCell align='center'>{pedido.completo ? 'Completo' : 'Incompleto'}</TableCell>
                          <TableCell align='center'>▢</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </>
              ))}
              </Table>
          </Box>
        <Table stickyHeader>
          <TableHead>
            <TableCell>Produtos não encontrados:</TableCell>
          </TableHead>
          {data.produtosNaoEncontrados.map((info: string) => (
            <TableRow>
              <TableCell>SKU: {info}</TableCell>
            </TableRow>
          ))}
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PrintPorPedido;
