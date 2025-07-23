import axios from 'axios';

const BASE_URL = 'http://151.243.0.78:3001';

// 🔍 Buscar produto por EAN
export async function buscarProdutoPorEAN(ean) {
  const eanLimpo = ean.replace(/[\n\r\t\s]/g, '').trim();
  const response = await axios.get(`${BASE_URL}/produto`);
  const produtos = response.data;

  const encontrado = produtos.find((p) =>
    p.ean && p.ean.replace(/[\n\r\t\s]/g, '').trim() === eanLimpo
  );

  if (!encontrado) {
    throw new Error('Produto com esse EAN não encontrado.');
  }

  return encontrado;
}

export async function buscarLocalizacaoPorEAN(ean) {
  const eanLimpo = ean.replace(/[\n\r\t\s]/g, '').trim();
  const response = await axios.get(`${BASE_URL}/localizacao`);
  const localizacoes = response.data;

  const encontrada = localizacoes.find((l) =>
    l.ean && l.ean.replace(/[\n\r\t\s]/g, '').trim() === eanLimpo
  );

  if (!encontrada) {
    throw new Error('Localização com esse EAN não encontrada.');
  }

  return {
    localizacao_id: encontrada.localizacao_id,
    nome: encontrada.nome,
    armazem:
      typeof encontrada.armazem === 'object'
        ? encontrada.armazem.nome
        : encontrada.armazem || '',
  };
}

// 🚚 Enviar movimentação (entrada / saída)
export async function enviarMovimentacao(payload) {
  try {
    const { data } = await axios.post(`${BASE_URL}/movimentacao`, payload);
    return data;
  } catch (err) {
    console.error('Erro ao enviar movimentação:', err);
    throw new Error('Falha ao enviar movimentação.');
  }
}

export async function buscarProdutosPorLocalizacaoDireto(localizacao_id) {
  const res = await axios.get(`http://151.243.0.78:3001/localizacao/${localizacao_id}/produtos`);
  console.log(
    '🔍 produtos_estoque[0]:',
    JSON.stringify(res.data.produtos_estoque[0], null, 2)
  );

  const dados = res.data?.produtos_estoque || [];

  return dados.map((item) => ({
    produto_estoque_id: item.produto_estoque_id,
    produto_id: item.produto?.produto_id,
    descricao: item.produto?.descricao || '',
    sku: item.produto?.sku || '',
    ean: item.produto?.ean || '',
    quantidade: item.quantidade || 0,
  }));
}