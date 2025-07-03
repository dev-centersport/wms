import axios, { AxiosError } from 'axios';

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
    }));

    return dados;
  } catch (err) {
    console.error('Erro ao buscar localizações →', err);
    throw new Error('Falha ao carregar as localizações do servidor.');
  }
};

export interface NovaLocalizacao {
  localizacao: string;
  tipo: string;
  altura: string;
  largura: string;
  comprimento: string;
  armazem: string;    // ainda existe no frontend, mas não será enviado
  endereco: string;   // idem
}

export const criarLocalizacao = async (novaLocalizacao: NovaLocalizacao): Promise<void> => {
  try {
    await axios.post('http://151.243.0.78:3001/localizacao', {
      nome: novaLocalizacao.localizacao,
      status: 'fechada',
      altura: '0',
      largura: '0',
      comprimento: '0',
      tipo_localizacao_id: 1,
      armazem_id: 1
    });
  } catch (err: any) {
    console.error('Erro ao criar nova localização →', err);

    if (axios.isAxiosError(err)) {
      if (err.response) {
        console.error('❌ Status do erro:', err.response.status);
        console.error('❌ Dados da resposta:', JSON.stringify(err.response.data, null, 2));
        alert(`Erro ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        console.error('❌ Nenhuma resposta recebida do servidor:', err.request);
        alert('Nenhuma resposta recebida do servidor.');
      } else {
        console.error('❌ Erro na configuração da requisição:', err.message);
        alert('Erro na configuração da requisição.');
      }
    } else {
      console.error('❌ Erro inesperado:', err);
      alert('Erro inesperado ao criar localização.');
    }

    throw new Error('Falha ao criar nova localização no servidor.');
  }
};
