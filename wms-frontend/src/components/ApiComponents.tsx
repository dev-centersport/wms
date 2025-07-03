import { useEffect, useState } from 'react';
import { buscarLocalizacoes, Localizacao as LocalizacaoAPI } from '../services/API';

/**
 * Interface estendida da localização original vinda da API.
 * Adiciona propriedades locais usadas apenas na interface do usuário.
 */
export interface Localizacao extends LocalizacaoAPI {
  /** Quantidade atual de itens na localização */
  quantidade: number;
  /** Capacidade máxima suportada pela localização */
  capacidade: number;
}

/**
 * Hook personalizado `useLocalizacoes`
 * 
 * Responsável por:
 * - Buscar dados de localizações da API
 * - Armazenar e gerenciar o estado da lista de localizações
 * - Gerenciar busca e filtros aplicados
 * - Controlar a exibição do formulário e do filtro
 * 
 * @returns Um objeto com os estados e funções úteis para manipulação de localizações
 */
export const useLocalizacoes = () => {
  // Lista principal de localizações com dados estendidos
  const [listaLocalizacoes, setListaLocalizacoes] = useState<Localizacao[]>([]);

  // Texto digitado pelo usuário para filtrar localizações
  const [busca, setBusca] = useState('');

  // Controle de exibição do formulário de criação/edição de localização
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Controle de exibição do filtro avançado
  const [mostrarFiltro, setMostrarFiltro] = useState(false);

  /**
   * Efeito executado uma vez ao montar o componente.
   * Realiza a chamada à API para buscar localizações e inicializa os campos extras.
   */
  useEffect(() => {
    const carregar = async () => {
      try {
        // Busca dados básicos da API
        const dadosBasicos = await buscarLocalizacoes();

        // Adiciona campos locais (quantidade e capacidade) a cada item
        const dadosCompletos: Localizacao[] = dadosBasicos.map((item) => ({
          ...item,
          quantidade: 0,
          capacidade: 0,
        }));

        setListaLocalizacoes(dadosCompletos);
      } catch (error: any) {
        alert(error.message); // Exibe erro caso a requisição falhe
      }
    };

    carregar();
  }, []);

  /**
   * Lista filtrada com base no texto digitado na busca.
   * Verifica correspondência parcial em várias propriedades da localização.
   */
  const locaisFiltrados = listaLocalizacoes.filter((item) => {
    const texto = busca.toLowerCase();
    return (
      item.nome.toLowerCase().includes(texto) ||
      item.tipo.toLowerCase().includes(texto) ||
      item.armazem.toLowerCase().includes(texto) ||
      item.ean.toLowerCase().includes(texto)
    );
  });

  // Exporta estados e funções para uso em componentes
  return {
    listaLocalizacoes,       // Lista completa com todos os itens
    locaisFiltrados,         // Lista filtrada com base na busca
    busca,                   // Texto atual da busca
    setBusca,                // Função para alterar a busca
    mostrarFormulario,       // Estado do formulário (visível ou não)
    setMostrarFormulario,    // Função para alternar visibilidade do formulário
    mostrarFiltro,           // Estado do filtro avançado
    setMostrarFiltro,        // Função para alternar visibilidade do filtro
    setListaLocalizacoes,    // Permite atualizar a lista (ex: ao excluir)
  };
};
