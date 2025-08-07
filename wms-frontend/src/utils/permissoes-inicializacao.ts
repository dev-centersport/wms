import { criarPermissoesPadrao, buscarPermissoes } from '../services/API';

/**
 * Função para inicializar permissões padrão no backend
 * Esta função deve ser chamada uma vez para criar as permissões básicas
 */
export const inicializarPermissoesPadrao = async (): Promise<void> => {
  try {
    console.log('Verificando se as permissões padrão já existem...');
    
    // Primeiro, tenta buscar as permissões existentes
    const permissoesExistentes = await buscarPermissoes();
    
    if (permissoesExistentes.length === 0) {
      console.log('Nenhuma permissão encontrada. Criando permissões padrão...');
      const permissoesCriadas = await criarPermissoesPadrao();
      console.log(`${permissoesCriadas.length} permissões padrão criadas com sucesso!`);
    } else {
      console.log(`${permissoesExistentes.length} permissões já existem no sistema.`);
    }
  } catch (error) {
    console.error('Erro ao inicializar permissões padrão:', error);
    throw new Error('Falha ao inicializar permissões padrão no sistema.');
  }
};

/**
 * Função para verificar se o sistema de permissões está configurado
 */
export const verificarSistemaPermissoes = async (): Promise<boolean> => {
  try {
    const permissoes = await buscarPermissoes();
    return permissoes.length > 0;
  } catch (error) {
    console.error('Erro ao verificar sistema de permissões:', error);
    return false;
  }
};
