import axios from 'axios';

const BASE_URL = 'http://151.243.0.78:3001';

export async function buscarProdutoEstoquePorLocalizacaoEAN(eanLocalizacao, codigoProduto) {
  try {
    const localizacao = await buscarLocalizacaoPorEAN(eanLocalizacao);
    const todos = await buscarProdutosPorLocalizacaoDireto(localizacao.localizacao_id);

    const encontrado = todos.find(p =>
      p.ean === codigoProduto.trim() || p.sku === codigoProduto.trim()
    );

    if (!encontrado) {
      throw new Error('Produto não encontrado nesta localização.');
    }

    return {
      produto_estoque_id: encontrado.produto_estoque_id,
      localizacao_id: localizacao.localizacao_id,
      quantidade: encontrado.quantidade,
    };
  } catch (error) {
    console.error('❌ Erro em buscarProdutoEstoquePorLocalizacaoEAN:', error);
    throw new Error(error?.message || 'Erro ao buscar produto na localização.');
  }
}


export async function criarOcorrencia(payload) {
  try {
    const response = await axios.post(`${BASE_URL}/ocorrencia`, payload);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar ocorrência:', error);
    throw new Error(
      error?.response?.data?.message || 'Erro ao registrar ocorrência.'
    );
  }
}