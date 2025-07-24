import React from 'react';

interface PedidoInfo {
  pedidoId: string;
  numeroPedido: string;
}

interface LocalizacaoItem {
  armazem: string;
  localizacao: string;
  descricao: string;
  eanProduto: string;
  urlFoto?: string | null;
  quantidadeSeparada: number;
  pedidosAtendidos?: PedidoInfo[];
}

interface PrintPorLocalizacaoProps {
  data: {
    localizacoes: LocalizacaoItem[];
  };
}

const PrintPorLocalizacao: React.FC<PrintPorLocalizacaoProps> = ({ data }) => {
  if (!data?.localizacoes?.length) {
    return <p>Nenhuma localização encontrada para impressão.</p>;
  }

  const agrupado = data.localizacoes.reduce((acc: { [key: string]: LocalizacaoItem[] }, item) => {
    const key = `${item.armazem}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const armazensOrdenados = Object.keys(agrupado).sort();

  return (
    <div id="relatorio-impressao">
      <style>{`
        @page { size: A4 portrait; margin: 1cm; }
        body { font-family: Arial, sans-serif; font-size: 9pt; }
        h1 { margin-bottom: 8px; font-size: 18px; }
        .armazem-block { margin-bottom: 25px; page-break-inside: avoid; }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9pt;
        }
        th, td {
          border: 1px solid #ccc;
          padding: 4px;
          text-align: left;
          vertical-align: middle;
        }
        th {
          background: #f4f4f4;
        }
        img {
          width: 40px;
          height: 40px;
          object-fit: contain;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .sem-imagem {
          font-size: 10px;
          color: #999;
        }
        .obs {
          border: 1px solid #aaa;
          margin-top: 6px;
          padding: 6px;
          font-size: 10px;
          height: 28px;
        }
        .header-bar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        @media print {
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          #relatorio-impressao, #relatorio-impressao * {
            visibility: visible;
          }
          #relatorio-impressao {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
          }
        }
      `}</style>

      

      

      {armazensOrdenados.map((armazem) => (
        <div key={armazem} className="armazem-block">
          <h3 style={{ fontSize: '14px', marginBottom: 4 }}>{armazem}</h3>
          <table>
            <thead>
              <tr>
                <th>Imagem</th>
                <th>Descrição</th>
                <th>EAN</th>
                <th>Localização</th>
                <th>Qtd</th>
              </tr>
            </thead>
            <tbody>
              {agrupado[armazem].map((item, idx) => (
                <tr key={idx}>
                  <td>
                    {item.urlFoto ? (
                      <img src={item.urlFoto} alt="produto" />
                    ) : (
                      <span className="sem-imagem">Sem imagem</span>
                    )}
                  </td>
                  <td>{item.descricao}</td>
                  <td>{item.eanProduto}</td>
                  <td><strong>{item.localizacao}</strong></td>
                  <td>{item.quantidadeSeparada}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default PrintPorLocalizacao;
