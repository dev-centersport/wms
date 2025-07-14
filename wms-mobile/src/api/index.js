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

