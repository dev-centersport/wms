import axios from 'axios'

const BASE_URL = 'http://151.243.0.78:3001';

const api = axios.create({
  baseURL: 'http://151.243.0.78:3001', // ou a URL da sua API
});

export default api;

// ---------- TIPOS ----------
export interface Armazem {
  armazem_id: number;
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;
  altura?: number;
  largura?: number;
  comprimento?: number;
}

// Adicione esta função ao arquivo API.tsx

export async function buscarProdutosPorLocalizacao(localizacaoId: number) {
  try {
    const todos = await buscarConsultaEstoque();
    return todos
      .filter((item: any) => item.localizacao_id === localizacaoId)
      .map((item: any) => ({
        produto_id: item.produto_id,
        descricao: item.descricao || '',
        sku: item.sku || '',
        ean: item.ean || '',
        quantidade: item.quantidade || 0,
      }));
  } catch (err) {
    console.error('Erro ao buscar produtos da localização:', err);
    throw err;
  }
}



// ---------- POST /armazem ----------
export interface CriarArmazemPayload {
  nome: string;
  endereco: string;
  cidade: string;
  estado: string;      // ex.: "SP"
  largura?: number;    // cm
  altura?: number;     // cm
  comprimento?: number;// cm
}
export const atualizarArmazem = async (id: number, dados: {
  nome: string;
  endereco: string;
  largura?: number;
  altura?: number;
  comprimento?: number;
}) => {
  try {
    await api.patch(`/armazem/${id}`, dados);
  } catch (err: any) {
    console.error('Erro ao atualizar armazém:', err);
    throw new Error('Falha ao atualizar armazém.');
  }
};


/**
 * Cria um novo armazém.
 * Converte dimensões para número e lança erros detalhados.
 */
export const criarArmazem = async (
  dados: CriarArmazemPayload,
): Promise<Armazem> => {
  try {
    // Garantir que dimensões sejam numéricas ou undefined
    const payload = {
      ...dados,
      largura: dados.largura ? Number(dados.largura) : undefined,
      altura: dados.altura ? Number(dados.altura) : undefined,
      comprimento: dados.comprimento ? Number(dados.comprimento) : undefined,
    };

    const { data } = await api.post<Armazem>('/armazem', payload);
    return data;
  } catch (err: any) {
    console.error('Erro ao criar armazém →', err);

    if (axios.isAxiosError(err) && err.response) {
      throw new Error(
        `Erro ${err.response.status}: ${JSON.stringify(err.response.data)}`,
      );
    }
    throw new Error('Falha ao criar o armazém no servidor.');
  }
};

export interface Localizacao {
  localizacao_id: number;
  nome: string;
  tipo: string;
  armazem: string;
  ean: string;
  endereco: string;
  total_produtos: string;
}
export const excluirTipoLocalizacao = async (id: number): Promise<void> => {
  try {
    await api.delete(`/tipo-localizacao/${id}`);
  } catch (err) {
    console.error('Erro ao excluir tipo de localização:', err);
    throw new Error('Falha ao excluir o tipo de localização.');
  }
};

export const buscarTipoLocalizacao = async (id: number): Promise<TipoLocalizacao> => {
  try {
    const { data } = await api.get(`/tipo-localizacao/${id}`);
    return data;
  } catch (err) {
    console.error('Erro ao buscar tipo de localização:', err);
    throw new Error('Falha ao carregar o tipo de localização.');
  }
};
export const atualizarTipoLocalizacao = async (id: number, payload: { tipo: string }): Promise<void> => {
  try {
    await api.patch(`/tipo-localizacao/${id}`, payload);
  } catch (err) {
    console.error('Erro ao atualizar tipo de localização:', err);
    throw new Error('Falha ao atualizar tipo de localização.');
  }
};
export const criarTipoLocalizacao = async (payload: { tipo: string }): Promise<void> => {
  try {
    await api.post(`/tipo-localizacao`, payload);
  } catch (err) {
    console.error('Erro ao criar tipo de localização:', err);
    throw new Error('Falha ao criar tipo de localização.');
  }
};

export async function buscarProdutos() {
  const response = await api.get('/produto');
  return response.data;
}


export async function buscarConsultaEstoque() {
  try {
    const [estoqueRes, localizacoes] = await Promise.all([
      axios.get('http://151.243.0.78:3001/produto-estoque'),
      buscarLocalizacoes(),
    ]);

    const dados = estoqueRes.data.map((item: any) => {
      return {
        produto_id: item.produto_id,
        localizacao_id: item.localizacao?.localizacao_id ?? null,  // ESSENCIAL
        descricao: item.produto?.descricao || '',
        sku: item.produto?.sku || '',
        ean: item.produto?.ean || '',
        armazem: item.localizacao?.armazem?.nome || '',
        localizacao: item.localizacao?.nome || '',
        quantidade: item.quantidade || 0,
      };
    });

    return dados;
  } catch (err) {
    console.error('Erro ao buscar consulta de estoque →', err);
    throw new Error('Falha ao carregar os dados de estoque.');
  }
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
      total_produtos: item.total_produtos ?? '',
    }));

    return dados;
  } catch (err) {
    console.error('Erro ao buscar localizações →', err);
    throw new Error('Falha ao carregar as localizações do servidor.');
  }
};
// Novo: busca uma localização individual
export const buscarLocalizacao = async (id: number) => {
  const resp = await api.get(`/localizacao/${id}`);
  return resp.data;           // { nome, tipo, altura, largura, comprimento, … }
};

// Novo: atualiza localização
// services/API.ts
export const atualizarLocalizacao = async (id: number, payload: any) => {
  await api.patch(`/localizacao/${id}`, payload);
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
// services/API.ts
export const excluirArmazem = async (id: number): Promise<void> => {
  try {
    await api.delete(`/armazem/${id}`);
    console.log(`Armazém ID ${id} excluído com sucesso.`);
  } catch (err: any) {
    console.error('Erro ao excluir armazém →', err);
    throw new Error('Falha ao excluir o armazém.');
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
  armazem: string
  altura: string;
  largura: string;
  comprimento: string;
}


export const criarLocalizacao = async (criarLocalizacao: criarLocalizacao): Promise<void> => {
  try {
    const armazens = await buscarArmazem();
    const tipos = await buscarTiposDeLocalizacao();

    // const armazemSelecionado = armazens[0];

    // if (!armazemSelecionado?.armazem_id) {
    //   throw new Error('Nenhum armazém válido encontrado.');
    // }
    const armazemSelecionado = armazens.find(
      (a) => a.nome.toLowerCase() === criarLocalizacao.armazem.toLowerCase()
    );

    if (!armazemSelecionado?.armazem_id) {
      throw new Error(`Armazém "${criarLocalizacao.armazem}" não encontrado."${criarLocalizacao.tipo.toLowerCase()}"`);
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

export interface ExcluirLocalizacao {
  localizacao_id: number;
}

export const excluirLocalizacao = async ({ localizacao_id }: ExcluirLocalizacao): Promise<void> => {
  try {
    await axios.delete(`http://151.243.0.78:3001/localizacao/${localizacao_id}`);
    console.log(`Localização ID ${localizacao_id} excluída com sucesso.`);
  } catch (err) {
    console.error('Erro ao excluir localização →', err);

    if (axios.isAxiosError(err)) {
      if (err.response) {
        alert(`Erro ${err.response.status}: ${JSON.stringify(err.response.data)}`);
      } else if (err.request) {
        alert('Nenhuma resposta recebida do servidor.');
      } else {
        alert('Erro na configuração da requisição.');
      }
    } else {
      alert('Erro inesperado ao excluir localização.');
    }

    throw new Error('Falha ao excluir a localização.');
  }
};

export async function buscarProdutoPorEAN(ean: string) {
  const response = await axios.get('http://151.243.0.78:3001/produto');
  const produtos = response.data;

  const encontrado = produtos.find((p: any) => p.ean === ean.trim());

  if (!encontrado) {
    throw new Error('Produto com esse EAN não encontrado.');
  }

  return encontrado;
}

export async function buscarLocalizacaoPorEAN(ean: string) {
  const response = await axios.get('http://151.243.0.78:3001/localizacao');
  const localizacoes = response.data;

  const encontrada = localizacoes.find((l: any) => l.ean === ean.trim());

  if (!encontrada) {
    throw new Error('Localização com esse EAN não encontrada.');
  }

  return encontrada;
}

// Enviar movimentação para a API
export async function enviarMovimentacao(payload: {
  tipo: 'entrada' | 'saida' | 'transferencia';
  usuario_id: number;
  localizacao_origem_id: number;
  localizacao_destino_id: number;
  itens_movimentacao: {
    produto_id: number; // <- CORRETO
    quantidade: number;
  }[];
}) {
  try {
    const { data } = await api.post('http://151.243.0.78:3001/movimentacao', payload);
    return data;
  } catch (err: any) {
    console.error('Erro ao enviar movimentação:', err);
    if (err.response) {
      console.error('📛 Código:', err.response.status);
      console.error('📦 Dados do erro:', err.response.data);
    }
    throw err;
  }
}


