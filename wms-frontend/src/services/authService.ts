import Cookies from 'js-cookie';
import api from './API';

// ===== FUNÇÕES DE AUTENTICAÇÃO =====

/**
 * Salva o token no Cookies
 * @param {string} token - Token de autenticação
 */
export const salvarToken = async (token: string) => {
  try {
    Cookies.set('token', token, { expires: 1 });
    console.log('✅ Token salvo com sucesso');
  } catch (error) {
    console.error('❌ Erro ao salvar token:', error);
  }
};

/**
 * Remove o token do Cookies
 */
export const removerToken = async () => {
  try {
    Cookies.remove('token');
    console.log('✅ Token removido com sucesso');
  } catch (error) {
    console.error('❌ Erro ao remover token:', error);
  }
};

/**
 * Verifica se existe um token válido
 * @returns {Promise<boolean>} - Se existe token
 */
export const verificarToken = async (): Promise<boolean> => {
  try {
    const token = Cookies.get('token');
    return !!token;
  } catch (error) {
    console.error('❌ Erro ao verificar token:', error);
    return false;
  }
};

/**
 * Busca o perfil do usuário atual
 * @returns {Promise<any>} - Dados do usuário
 */
export const buscarPerfilUsuario = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao buscar perfil do usuário:', error);
    throw error;
  }
};

/**
 * Realiza logout no backend
 */
export const logoutBackend = async () => {
  try {
    await api.post('/auth/logout');
    console.log('✅ Logout realizado no backend');
  } catch (error) {
    console.error('❌ Erro ao fazer logout no backend:', error);
  }
};

/**
 * Função para limpar códigos (remove espaços, quebras de linha, etc.)
 * @param {string} valor - Valor a ser limpo
 * @returns {string} - Valor limpo
 */
export const limparCodigo = (valor: string): string => {
  if (!valor) return '';
  return valor.replace(/[\n\r\t\s]/g, '').trim();
};

/**
 * Função para tratar erros de forma padronizada
 * @param {any} error - Erro capturado
 * @param {string} contexto - Contexto da operação
 * @throws {Error} - Erro tratado
 */
export const tratarErro = (error: any, contexto: string = 'Operação') => {
  const mensagem =
    error?.response?.data?.message ||
    error?.message ||
    `Erro ao executar ${contexto}`;
  console.error(`❌ ${contexto}:`, error);
  throw new Error(mensagem);
};
