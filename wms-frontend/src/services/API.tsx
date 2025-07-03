import axios from 'axios'

export interface Localizacao {
  localizacao_id: number;
  nome: string;
  tipo: string;
  armazem: string;
  ean: string;
  endereco: string;
}

export const buscarLocalizacoes = async (): Promise<Localizacao[]> => {
  try {
    const res = await axios.get<any[]>('http://151.243.0.78:3001/localizacao');

    const dados: Localizacao[] = res.data.map((item) => ({
      localizacao_id: item.localizacao_id,
      nome: item.nome,
      tipo: item.tipo?.tipo ?? '',
      armazem: item.armazem?.nome ?? '',
      ean: item.ean ?? '',
      endereco: item.armazem?.endereco ?? '',
    }));

    return dados;
  } catch (err) {
    console.error('Erro ao buscar localizações →', err);
    throw new Error('Falha ao carregar as localizações do servidor.');
  }
};


export interface Armazem {
  armazem_id: number;
  nome: string;
  endereco: string;
}

export const buscarArmazem = async (): Promise<Armazem[]> => {
  try {
    const res = await axios.get<Armazem[]>('http://151.243.0.78:3001/armazem');
    return res.data;
  } catch (err) {
    console.error('Erro ao buscar armazéns →', err);
    throw new Error('Falha ao carregar os armazéns do servidor.');
  }
};


export interface TipoLocalizacao {
  tipo_localizacao_id: number;
  tipo: string;
}

export const buscarTiposDeLocalizacao = async (): Promise<TipoLocalizacao[]> => {
  try {
    const res = await axios.get<TipoLocalizacao[]>('http://151.243.0.78:3001/tipo-localizacao');

    return res.data;
  } catch (err) {
    console.error('Erro ao buscar tipos de localização →', err);
    throw new Error('Falha ao carregar os tipos de localização do servidor.');
  }
};

export interface criarLocalizacao {
  nome: string;
  status: string;
  tipo: string;
  altura: string;
  largura: string;
  comprimento: string;
}


export const criarLocalizacao = async (criarLocalizacao: criarLocalizacao): Promise<void> => {
  try {
    const armazens = await buscarArmazem();
    const tipos = await buscarTiposDeLocalizacao();

    const armazemSelecionado = armazens[0];

    if (!armazemSelecionado?.armazem_id) {
      throw new Error('Nenhum armazém válido encontrado.');
    }

    // Buscar o tipo_localizacao_id correspondente ao texto vindo do form
    const tipoSelecionado = tipos.find(
      (t) => t.tipo.toLowerCase() === criarLocalizacao.tipo.toLowerCase()
    );

    if (!tipoSelecionado?.tipo_localizacao_id) {
      throw new Error(`Tipo de localização "${criarLocalizacao.tipo}" não encontrado.`);
    }

    await axios.post('http://151.243.0.78:3001/localizacao', {
      nome: criarLocalizacao.nome,
      status: 'fechada',
      altura: criarLocalizacao.altura,
      largura: criarLocalizacao.largura,
      comprimento: criarLocalizacao.comprimento,
      tipo_localizacao_id: tipoSelecionado.tipo_localizacao_id,
      armazem_id: armazemSelecionado.armazem_id,
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