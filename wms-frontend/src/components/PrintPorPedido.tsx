import React, { useRef, useEffect, useState, useCallback } from 'react';
import JsBarcode from 'jsbarcode';

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
            width: 1,
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
        @page { size: A4 portrait; margin: 1cm; }
        body { font-family: Arial, sans-serif; font-size: 9pt; }
        .pedido-header-content {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pedido-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 6px;
          page-break-inside: avoid;
        }
        .pedido-table th, .pedido-table td {
          border: 1px solid #ddd;
          padding: 3px 4px;
          vertical-align: top;
        }
        .product-info {
          display: flex;
          align-items: flex-start;
        }
        .product-image {
          height: 32px;
          width: 32px;
          margin-right: 4px;
          object-fit: contain;
          border: 1px solid #000;
          border-radius: 4px;
        }
        .codigo-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
        }
        svg.barcode {
          height: 18px !important;
          margin: 0 !important;
        }
        .no-print {
          margin: 6px 0;
          text-align: center;
        }
        .header h1 {
          margin-bottom: 4px;
          font-size: 14px;
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
                          <div>
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
