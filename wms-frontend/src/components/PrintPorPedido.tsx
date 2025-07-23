// PrintPorPedido.tsx
import React from 'react';
import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Box, TableContainer, Paper } from '@mui/material';

interface PrintPorPedidoProps {
  data: {
    pedidos: {
      numeroPedido: string;
      completo: boolean;
      itens: {
        sku: string;
        idItem: string;
        urlFoto?: string;
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
                <TableCell align="center">Foto</TableCell>
                <TableCell align="center">SKU / EAN</TableCell>
                <TableCell align="center">Qtd a Separar</TableCell>
                <TableCell align="center">Localização/Armazém</TableCell>
                <TableCell align="center">Pedido Completo</TableCell>
                <TableCell align="center">Anotações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.pedidos.map((pedido) => (
                pedido.itens.map((item) => (
                  item.localizacoes.map((loc, idx2) => (
                    <TableRow key={`${item.idItem}-${idx2}`}>
                      <TableCell align="center">
                        {item.urlFoto && item.urlFoto !== 'n/d' ? (
                          <img
                            src={item.urlFoto}
                            alt="Produto"
                            style={{ height: '40px', width: 'auto', maxWidth: '60px' }}
                          />
                        ) : (
                          'Sem imagem'
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {item.sku} <br />EAN
                      </TableCell>
                      <TableCell align="center">{loc.quantidadeSeparada}</TableCell>
                      <TableCell align="center">{loc.localizacao} - {loc.armazem.armazem}</TableCell>
                      <TableCell align="center">{pedido.completo ? 'Completo' : 'Incompleto'}</TableCell>
                      <TableCell align="center">&#9633;</TableCell>
                    </TableRow>
                  ))
                ))
              ))}
            </TableBody>
          </Table>
        </Box>

        {data.produtosNaoEncontrados?.length > 0 && (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Produtos não encontrados:</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.produtosNaoEncontrados.map((info: string, idx) => (
                <TableRow key={idx}>
                  <TableCell>SKU: {info}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </Box>
  );
};

export default PrintPorPedido;
