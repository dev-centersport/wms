import React from 'react';

interface Item {
  sku: string;
  idItem: string;
  ean?: string;
  localizacoes: { armazem: string; localizacao: string }[];
  descricao?: string;
  url_foto?: string;
}

interface Pedido {
  numeroPedido: string;
  itens: Item[];
}

interface PrintPorPedidoProps {
  data: {
    pedidos: Pedido[];
  };
}

const PrintPorPedido: React.FC<PrintPorPedidoProps> = ({ data }) => {
  if (!data?.pedidos?.length) {
    return <p>Nenhum pedido encontrado.</p>;
  }

  const pedidosPorLocalizacao: { [key: string]: Pedido[] } = {};

  data.pedidos.forEach((pedido) => {
    pedido.itens.forEach((item) => {
      const key = item.localizacoes?.length
        ? item.localizacoes.map((loc: any) => `${loc.armazem} - ${loc.localizacao}`).join(', ')
        : 'Sem localização';

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
    <div>
      <style>{`
        @page {
          size: A4;
          margin: 1cm;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 10pt;
        }
        .header {
          text-align: center;
          margin-bottom: 10px;
          border-bottom: 2px solid #333;
          padding-bottom: 5px;
        }
        .header h1 {
          margin: 0;
          font-size: 12pt;
        }
        .localizacao-section {
          page-break-inside: avoid;
        }
        .pedido-table {
          width: 100%;
          border-collapse: collapse;
        }
        .pedido-table th, .pedido-table td {
          border: 1px solid #ddd;
          padding: 5px;
          vertical-align: top;
        }
        .pedido-table th {
          background-color: #f2f2f2;
          text-align: left;
        }
        .pedido-header {
          background-color: #e6e6e6;
          font-weight: bold;
        }
        .product-info {
          display: flex;
          align-items: center;
        }
        .product-image {
          height: 40px;
          width: 40px;
          margin-right: 5px;
          object-fit: contain;
          border: solid 1px rgba(0, 0, 0, 0.5);
          border-radius: 5px;
        }
        .barcode {
          display: block;
          width: 100px;
          height: 40px;
        }
        .barcode svg {
          width: 100%;
          height: 100%;
        }
        .no-print {
          margin: 10px 0;
          text-align: center;
        }
        @media print {
          .no-print {
            display: none;
          }
          body {
            font-size: 8pt;
          }
          .pedido-table th, .pedido-table td {
            padding: 3px;
          }
        }
      `}</style>

      <div className="header">
        <h1>RELATÓRIO DE SEPARAÇÃO POR PEDIDO E LOCALIZAÇÃO</h1>
        <p>Gerado em: {new Date().toLocaleString()}</p>
      </div>

      <div className="no-print">
        <button onClick={() => window.print()} style={{ padding: '5px 10px', fontSize: '10pt' }}>
          Imprimir Relatório
        </button>
      </div>

      {localizacoesOrdenadas.map((localizacaoKey) => {
        const pedidos = pedidosPorLocalizacao[localizacaoKey].sort((a, b) =>
          a.numeroPedido.localeCompare(b.numeroPedido)
        );

        return (
          <div className="localizacao-section" key={localizacaoKey}>
            {pedidos.map((pedido) => (
              <table className="pedido-table" key={pedido.numeroPedido}>
                <thead>
                  <tr className="pedido-header">
                    <th colSpan={5}>
                      PEDIDO: {pedido.numeroPedido}
                    </th>
                  </tr>
                  <tr>
                    <th style={{ width: '60%' }}>Produto</th>
                    <th style={{ width: '5%' }}>Qtd.</th>
                    <th style={{ width: '10%' }}>Código</th>
                    <th style={{ width: '18%' }}>Armazém/Localização</th>
                    <th style={{ width: '7%' }}>Anotações</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.itens.map((item, idx) => {
                    const localizacaoTexto = item.localizacoes?.length
                      ? item.localizacoes.map(loc => `${loc.armazem} - ${loc.localizacao}`).join(', ')
                      : 'Sem localização';

                    const codigoBarras = (item.ean || item.idItem || '').padStart(12, '0');

                    return (
                      <tr key={idx}>
                        <td>
                          <div className="product-info">
                            {item.url_foto && item.url_foto !== 'n/d' && (
                              <img src={item.url_foto} alt={item.descricao} className="product-image" />
                            )}
                            <div>
                              <strong>{item.sku}</strong><br />
                              {item.descricao || 'Sem descrição'}
                            </div>
                          </div>
                        </td>
                        <td>1</td>
                        <td>
                          <div>{item.sku}</div>
                          <div className="barcode">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50">
                              <text x="0" y="40" fontFamily="monospace" fontSize="40">{codigoBarras}</text>
                            </svg>
                          </div>
                        </td>
                        <td>{localizacaoTexto}</td>
                        <td></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default PrintPorPedido;
