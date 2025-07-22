import axios from 'axios';
import { buscarProdutosPorLocalizacaoDireto } from './movimentacaoAPI';

const BASE_URL = 'http://151.243.0.78:3001';

// 🧼 Função utilitária para limpar EAN e SKU
const limparCodigo = (valor) => valor.replace(/[\n\r\t\s]/g, '').trim();

// Cache localizações por EAN
let cacheMapLocalizacoes = null;

// ✅ Buscar localização por EAN com sanitização
export async function buscarLocalizacaoPorEAN(ean) {
  try {
    const eanLimpo = limparCodigo(ean);

    const response = await axios.get(`${BASE_URL}/localizacao/buscar-por-ean/${eanLimpo}`);
    const loc = response.data;

    if (!loc || !loc.localizacao_id) {
      throw new Error('Localização com esse EAN não encontrada.');
    }

    return {
      localizacao_id: loc.localizacao_id,
      nome: loc.nome || loc.localizacao_nome || '',
      armazem: loc.armazem_nome || '', // caso queira incluir o nome do armazém
    };
  } catch (err) {
    console.error('Erro ao buscar localização:', err);
    throw err;
  }
}


// 🔍 Buscar produto na localização com cache e sanitização
const cacheProdutosPorLocalizacao = new Map();

export async function buscarProdutoEstoquePorLocalizacaoEAN(eanLocalizacao, codigoProduto) {
  try {
    const eanLocal = limparCodigo(eanLocalizacao);
    const codProduto = limparCodigo(codigoProduto);

    const localizacao = await buscarLocalizacaoPorEAN(eanLocal);
    const localizacaoID = localizacao.localizacao_id;

    let produtos = cacheProdutosPorLocalizacao.get(localizacaoID);

    if (!produtos) {
      produtos = await buscarProdutosPorLocalizacaoDireto(localizacaoID);
      cacheProdutosPorLocalizacao.set(localizacaoID, produtos);
    }

    const encontrado = produtos.find(
      (p) =>
        limparCodigo(p.ean) === codProduto ||
        limparCodigo(p.sku) === codProduto
    );

    if (!encontrado) {
      throw new Error('Produto não encontrado nesta localização.');
    }

    return {
      produto_estoque_id: encontrado.produto_estoque_id,
      localizacao_id: localizacaoID,
      quantidade: encontrado.quantidade,
    };
  } catch (error) {
    console.error('Erro ao buscar produto na localização:', error);
    throw new Error(error?.message || 'Erro ao buscar produto na localização.');
  }
}

// 🔧 Criar ocorrência com erro tratado
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
