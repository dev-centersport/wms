import axios from 'axios';

const BASE_URL = 'http://151.243.0.78:3001';

// ---------- AUTENTICAÇÃO ----------
export async function login(usuario, senha) {
  try {
    const response = await axios.get(`${BASE_URL}/usuario`);
    const usuarios = response.data;

    const encontrado = usuarios.find(
      (u) => u.usuario === usuario && u.senha === senha
    );

    if (!encontrado) {
      return { success: false };
    }

    return { success: true, usuario: encontrado };
  } catch (err) {
    console.error('Erro na autenticação:', err);
    throw err;
  }
}

// ---------- CONSULTA DE ESTOQUE ----------
export async function buscarConsultaEstoque() {
  try {
    const [estoqueRes, localizacoes] = await Promise.all([
      axios.get(`${BASE_URL}/produto-estoque`),
      buscarLocalizacoes(),
    ]);

    return estoqueRes.data.map((item) => ({
      produto_id: item.produto_id,
      localizacao_id: item.localizacao?.localizacao_id ?? null,
      descricao: item.produto?.descricao || '',
      sku: item.produto?.sku || '',
      ean: item.produto?.ean || '',
      armazem: item.localizacao?.armazem?.nome || '',
      localizacao: item.localizacao?.nome || '',
      quantidade: item.quantidade || 0,
    }));
  } catch (err) {
    console.error('Erro ao buscar consulta de estoque →', err);
    throw new Error('Falha ao carregar os dados de estoque.');
  }
}

// ---------- LOCALIZAÇÕES ----------
export async function buscarLocalizacoes() {
  try {
    const response = await axios.get(`${BASE_URL}/localizacao`);
    return response.data;
  } catch (err) {
    console.error('Erro ao buscar localizações:', err);
    return [];
  }
}

// 🔍 Buscar produto por EAN
export async function buscarProdutoPorEAN(ean) {
  const response = await axios.get(`${BASE_URL}/produto`);
  const produtos = response.data;

  const encontrado = produtos.find((p) => p.ean === ean.trim());

  if (!encontrado) {
    throw new Error('Produto com esse EAN não encontrado.');
  }

  return encontrado;
}

// 📦 Buscar localização por EAN (com nome e armazém)
export async function buscarLocalizacaoPorEAN(ean) {
  const response = await axios.get(`${BASE_URL}/localizacao`);
  const localizacoes = response.data;

  const encontrada = localizacoes.find((l) => l.ean === ean.trim());

  if (!encontrada) {
    throw new Error('Localização com esse EAN não encontrada.');
  }

  return {
    localizacao_id: encontrada.localizacao_id,
    nome: encontrada.nome,
    armazem: typeof encontrada.armazem === 'object'
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

// Buscar todos produtos de uma localização
export async function buscarProdutosPorLocalizacaoDireto(localizacao_id) {
  const res = await axios.get(`${BASE_URL}/localizacao/${localizacao_id}/produtos`);
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

// 🔧 NOVA função: buscar produto dentro da localização
export async function buscarProdutoEstoquePorLocalizacaoEAN(eanLocalizacao, codigoProduto) {
  try {
    const localizacao = await buscarLocalizacaoPorEAN(eanLocalizacao);
    const todos = await buscarProdutosPorLocalizacaoDireto(localizacao.localizacao_id);

    const encontrado = todos.find(p =>
      p.ean === codigoProduto.trim() || p.sku === codigoProduto.trim()
    );

    if (!encontrado) throw new Error('Produto não encontrado nesta localização.');

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

// Criar ocorrência
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