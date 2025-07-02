// src/services/API.tsx
import axios from 'axios';

export interface ApiLocalizacao {
  localizacao_id: number;
  status: string;
  nome: string;
  altura: string;
  largura: string;
  comprimento: string;
  ean: string;
  tipo: {
    tipo_localizacao_id: number;
    tipo: string;
  };
  armazem: {
    armazem_id: number;
    nome: string;
    endereco: string;
  };
}

export interface Localizacao {
  localizacao: string;
  tipo: string;
  armazem: string;
  ean: string;
  endereco: string;
}

export const buscarLocalizacoes = async (): Promise<Localizacao[]> => {
  try {
    const res = await axios.get<ApiLocalizacao[]>('http://151.243.0.78:3001/localizacao');

    const dados: Localizacao[] = res.data.map((item) => ({
      localizacao: item.nome ?? '',
      tipo: item.tipo?.tipo ?? '',
      armazem: item.armazem?.nome ?? '',
      ean: item.ean ?? '',
      endereco: item.armazem.endereco ?? '',
    }))

    return dados;
  } catch (err) {
    console.error('Erro ao buscar localizações →', err);
    throw new Error('Falha ao carregar as localizações do servidor.');
  }
};
