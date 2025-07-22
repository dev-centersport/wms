import React from 'react';
import { Box, Typography, Button } from '@mui/material';

interface Produto {
  sku: string;
  descricao?: string;
  codigo_barras?: string;
  urlFoto?: string;
  armazem: string;
  localizacao: string;
}

interface Item {
  produto: Produto;
  quantidade_pedido: number;
}

interface Pedido {
  numero_pedido: string;
  pedido_id?: string;
  itens: Item[];
}

interface PrintPorPedidoProps {
  data: {
    pedidos: Pedido[];
  };
}

const PrintPorPedido: React.FC<PrintPorPedidoProps> = ({ data }) => {
  if (!data?.pedidos?.length) {
    return <Typography>Nenhum pedido encontrado.</Typography>;
  }

  const pedidosPorLocalizacao: { [key: string]: Pedido[] } = {};

  data.pedidos.forEach((pedido) => {
    pedido.itens.forEach((item) => {
      const key = `${item.produto.armazem} - ${item.produto.localizacao}`;
      if (!pedidosPorLocalizacao[key]) {
        pedidosPorLocalizacao[key] = [];
      }
      if (!pedidosPorLocalizacao[key].includes(pedido)) {
        pedidosPorLocalizacao[key].push(pedido);
      }
    });
  });

  const localizacoesOrdenadas = Object.keys(pedidosPorLocalizacao).sort();

  return (
    <Box sx={{ padding: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4">RELATÓRIO DE SEPARAÇÃO POR PEDIDO E LOCALIZAÇÃO</Typography>
        <Typography variant="body2">Gerado em: {new Date().toLocaleString()}</Typography>
      </Box>

      <Box sx={{ display: 'block', mb: 2 }}>
        <Button variant="contained" onClick={() => window.print()}>Imprimir Relatório</Button>
      </Box>

      {localizacoesOrdenadas.map((localizacaoKey) => {
        const pedidos = pedidosPorLocalizacao[localizacaoKey].sort((a, b) =>
          a.numero_pedido.localeCompare(b.numero_pedido)
        );

        return (
          <Box key={localizacaoKey} sx={{ mb: 4 }}>
            {pedidos.map((pedido) => (
              <table key={pedido.numero_pedido} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f0f0f0' }}>
                    <th colSpan={5} style={{ textAlign: 'left', padding: '8px', border: '1px solid #ccc' }}>
                      PEDIDO: {pedido.numero_pedido} {pedido.pedido_id && `(ID: ${pedido.pedido_id})`}
                    </th>
                  </tr>
                  <tr>
                    <th style={{ border: '1px solid #ccc', padding: '8px' }}>Produto</th>
                    <th style={{ border: '1px solid #ccc', padding: '8px' }}>Qtd.</th>
                    <th style={{ border: '1px solid #ccc', padding: '8px' }}>Código</th>
                    <th style={{ border: '1px solid #ccc', padding: '8px' }}>Armazém/Localização</th>
                    <th style={{ border: '1px solid #ccc', padding: '8px' }}>Anotações</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.itens
                    .filter((item) => `${item.produto.armazem} - ${item.produto.localizacao}` === localizacaoKey)
                    .sort((a, b) => a.produto.sku.localeCompare(b.produto.sku))
                    .map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ border: '1px solid #ccc', padding: '8px', display: 'flex', alignItems: 'center' }}>
                          <div style={{ width: 12, height: 12, backgroundColor: '#000', marginRight: 8 }}></div>
                          {item.produto.urlFoto && item.produto.urlFoto !== 'n/d' && (
                            <img src={item.produto.urlFoto} alt={item.produto.descricao} style={{ height: 40, marginRight: 8 }} />
                          )}
                          <div>
                            <strong>{item.produto.sku}</strong><br />
                            {item.produto.descricao || 'Sem descrição'}
                          </div>
                        </td>
                        <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{item.quantidade_pedido}</td>
                        <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                          <div>{item.produto.sku}</div>
                          {item.produto.codigo_barras ? (
                            <div style={{ fontSize: '10px' }}>{item.produto.codigo_barras}</div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td style={{ border: '1px solid #ccc', padding: '8px' }}>{localizacaoKey}</td>
                        <td style={{ border: '1px solid #ccc', padding: '8px' }}></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ))}
          </Box>
        );
      })}
    </Box>
  );
};

export default PrintPorPedido;
