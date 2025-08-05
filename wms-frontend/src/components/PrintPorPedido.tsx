import React, { useRef, useEffect, useState, useCallback } from 'react';
import JsBarcode from 'jsbarcode';

interface Item {
  sku: string;
  idItem: string;
  ean?: string;
  localizacoes: { armazem: string; localizacao: string }[];
  descricao?: string;
  urlFoto?: string;
}

interface Pedido {
  numeroPedido: string;
  itens: Item[];
}

interface PrintPorPedidoProps {
  data?: {
    pedidos: Pedido[];
  };
}

const PrintPorPedido: React.FC<PrintPorPedidoProps> = ({ data }) => {
  const [codigosGerados, setCodigosGerados] = useState(false);

  const gerarTodosCodigos = useCallback(() => {
    try {
      const svgs = document.querySelectorAll("svg[data-barcode]");
      svgs.forEach((svg) => {
        const value = svg.getAttribute("data-barcode");
        if (value) {
                     JsBarcode(svg, value, {
             format: value.length === 13 ? "EAN13" : "CODE128",
             lineColor: "#000",
             width: 0.8,
             height: 18,
             displayValue: value.length !== 13,
             fontSize: 8,
             margin: 0,
           });
        }
      });
      setCodigosGerados(true);
    } catch (error) {
      console.error("Erro na geração dos códigos de barras:", error);
      setCodigosGerados(true);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      gerarTodosCodigos();
    }, 200);
    return () => clearTimeout(timeout);
  }, [gerarTodosCodigos]);

  const handlePrint = () => {
    if (!codigosGerados) {
      alert("Aguarde os códigos de barras serem gerados antes de imprimir.");
      return;
    }
    setTimeout(() => {
      window.print();
    }, 200);
  };

  if (!data?.pedidos?.length)
    return <p>Nenhum pedido encontrado para impressão.</p>;

  const pedidosPorLocalizacao: { [key: string]: Pedido[] } = {};
  data.pedidos.forEach((pedido) => {
    pedido.itens.forEach((item) => {
      const key = item.localizacoes?.length
        ? item.localizacoes.map((loc) => `${loc.armazem} - ${loc.localizacao}`).join(", ")
        : "Sem localização";
      if (!pedidosPorLocalizacao[key]) pedidosPorLocalizacao[key] = [];
      if (!pedidosPorLocalizacao[key].some((p) => p.numeroPedido === pedido.numeroPedido)) {
        pedidosPorLocalizacao[key].push(pedido);
      }
    });
  });

  const localizacoesOrdenadas = Object.keys(pedidosPorLocalizacao).sort();

  return (
    <div id="relatorio-impressao">
             <style>{`
         @page { size: A4 portrait; margin: 0.5cm; }
         body { font-family: Arial, sans-serif; font-size: 8pt; }
         .pedido-header-content {
           display: flex;
           align-items: center;
           gap: 4px;
         }
         .pedido-table {
           width: 100%;
           border-collapse: collapse;
           margin-bottom: 3px;
           page-break-inside: avoid;
           table-layout: fixed;
         }
         .pedido-table th, .pedido-table td {
           border: 1px solid #ddd;
           padding: 2px 3px;
           vertical-align: top;
           word-wrap: break-word;
           overflow-wrap: break-word;
         }
        .pedido-table th:nth-child(1), .pedido-table td:nth-child(1) {
          width: 35%;
        }
        .pedido-table th:nth-child(2), .pedido-table td:nth-child(2) {
          width: 8%;
          text-align: center;
        }
        .pedido-table th:nth-child(3), .pedido-table td:nth-child(3) {
          width: 25%;
          text-align: center;
        }
        .pedido-table th:nth-child(4), .pedido-table td:nth-child(4) {
          width: 20%;
        }
        .pedido-table th:nth-child(5), .pedido-table td:nth-child(5) {
          width: 12%;
        }
        .product-info {
          display: flex;
          align-items: flex-start;
          gap: 4px;
        }
                 .product-image {
           height: 24px;
           width: 24px;
           object-fit: contain;
           border: 1px solid #000;
           border-radius: 2px;
           flex-shrink: 0;
         }
         .product-details {
           flex: 1;
           min-width: 0;
           font-size: 7pt;
         }
         .codigo-container {
           display: flex;
           flex-direction: column;
           align-items: center;
           gap: 1px;
           font-size: 7pt;
         }
         svg.barcode {
           height: 18px !important;
           margin: 0 !important;
         }
                 .no-print {
           margin: 3px 0;
           text-align: center;
         }
         .header h1 {
           margin-bottom: 2px;
           font-size: 12px;
         }
         .localizacao-section {
           margin-bottom: 2px;
         }
        @media print {
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          #relatorio-impressao, #relatorio-impressao * { visibility: visible; }
          #relatorio-impressao {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }
        }
      `}</style>

      

      {localizacoesOrdenadas.map((localizacaoKey) => (
        <div className="localizacao-section" key={localizacaoKey}>
          {pedidosPorLocalizacao[localizacaoKey].map((pedido) => (
            <table className="pedido-table" key={pedido.numeroPedido}>
              <thead>
                <tr className="pedido-header">
                  <th colSpan={5}>
                    <div className="pedido-header-content">
                      <svg data-barcode={pedido.numeroPedido} className="barcode" />
                      <span><strong>PEDIDO:</strong> {pedido.numeroPedido}</span>
                    </div>
                  </th>
                </tr>
                <tr>
                  <th>Produto</th>
                  <th>Qtd.</th>
                  <th>SKU/EAN</th>
                  <th>Localização</th>
                  <th>Anotações</th>
                </tr>
              </thead>
              <tbody>
                {pedido.itens.map((item, iIndex) => {
                  const localizacaoTexto = item.localizacoes?.length
                    ? item.localizacoes.map(loc => `${loc.armazem} - ${loc.localizacao}`).join(', ')
                    : 'Sem localização';

                  return (
                    <tr key={`${pedido.numeroPedido}-${iIndex}`}>
                      <td>
                        <div className="product-info">
                          <img src={item.urlFoto} alt="produto" className="product-image" />
                          <div className="product-details">
                            <strong>{item.sku}</strong><br />
                            {item.descricao || 'Sem descrição'}
                          </div>
                        </div>
                      </td>
                      <td>1</td>
                      <td>
                        <div className="codigo-container">
                          <div>{item.sku}</div>
                          {item.ean && /^[0-9]{12,13}$/.test(item.ean) && (
                            <svg data-barcode={item.ean} className="barcode" />
                          )}
                          <div>{item.ean || '-'}</div>
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
      ))}
    </div>
  );
};

export default PrintPorPedido;
