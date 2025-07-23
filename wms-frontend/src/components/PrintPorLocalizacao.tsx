import React from 'react';

interface LocalizacaoItem {
  armazem: string;
  localizacao: string;
  produtoSKU: string;
  produtoDescricao: string;
  produtoEAN: string;
  produtoFoto?: string;
  quantidadeSeparada: number;
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
    const key = `${item.armazem} - ${item.localizacao}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const localizacoesOrdenadas = Object.keys(agrupado).sort();

  return (
    <div id="relatorio-impressao">
      <style>{`
        @page { size: A4 portrait; margin: 1cm; }
        body { font-family: Arial, sans-serif; font-size: 9pt; }
        .header h1 { margin-bottom: 5px; font-size: 18px; }
        .localizacao-block { margin-bottom: 25px; page-break-inside: avoid; }
        .localizacao-titulo { font-weight: bold; background-color: #e0e0e0; padding: 6px; margin-bottom: 8px; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 9pt; }
        th, td { border: 1px solid #ccc; padding: 4px; text-align: left; vertical-align: middle; }
        img { width: 45px; height: 45px; object-fit: contain; border: 1px solid #ccc; border-radius: 4px; }

        @media print {
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          #relatorio-impressao, #relatorio-impressao * { visibility: visible; }
          #relatorio-impressao { position: absolute; left: 0; top: 0; width: 100%; background: white; }
        }
      `}</style>

      <div className="header">
        <h1>RELATÓRIO DE SEPARAÇÃO POR LOCALIZAÇÃO</h1>
        <p>Gerado em: {new Date().toLocaleString()}</p>
      </div>

      {localizacoesOrdenadas.map((locKey) => (
        <div key={locKey} className="localizacao-block">
          <div className="localizacao-titulo">Localização: {locKey}</div>
          <table>
            <thead>
              <tr>
                <th>Imagem</th>
                <th>SKU</th>
                <th>Descrição</th>
                <th>EAN</th>
                <th>Qtd</th>
              </tr>
            </thead>
            <tbody>
              {agrupado[locKey].map((item, idx) => (
                <tr key={idx}>
                  <td>
                    {item.produtoFoto ? (
                      <img src={item.produtoFoto} alt="produto" />
                    ) : (
                      <span style={{ fontSize: '10px', color: '#999' }}>Sem imagem</span>
                    )}
                  </td>

                  <td>{item.produtoSKU}</td>
                  <td>{item.produtoDescricao}</td>
                  <td>{item.produtoEAN}</td>
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
