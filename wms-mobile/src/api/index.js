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

