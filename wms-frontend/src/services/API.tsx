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
// ✅ ESTA É A FUNÇÃO CERTA PARA USAR:
// dentro de services/API.ts
export interface Ocorrencia {
  ocorrencia_id: number;
  dataHora: string;
  ativo: boolean;
}

export interface AuditoriaItem {
  auditoria_id: number;
  conclusao: string;
  data_hora_inicio: string;
  data_hora_fim: string;
  status: string;
  usuario: {
    responsavel: string;
  };
  localizacao: {
    nome: string;
    ean: string;
  };
  ocorrencias: Ocorrencia[];
}

// ✅ Agora exportando corretamente
export async function buscarAuditoria(): Promise<AuditoriaItem[]> {
  try {
    const res = await axios.get('http://151.243.0.78:3001/auditoria');
    return res.data;
  } catch (err) {
    console.error('Erro ao buscar auditorias →', err);
    throw new Error('Falha ao carregar as auditorias do servidor.');
  }
}

export async function registrarConferenciaAuditoria(ocorrenciaId: number, bipados: Record<string, number>) {
  return await axios.post(`/auditoria/${ocorrenciaId}/registrar`, { bipados });
}
export async function buscarProdutosEsperadosDaOcorrencia(ocorrenciaId: number) {
  const response = await axios.get(`http://151.243.0.78:3001/ocorrencia/${ocorrenciaId}/produtos`);
  return response.data;
}
export async function login(usuario: string, senha: string) {
  try {
    const res = await axios.get('http://151.243.0.78:3001/usuario');
    const usuarios = res.data;

    const encontrado = usuarios.find(
      (u: any) => u.usuario === usuario && u.senha === senha
    );

    if (!encontrado) {
      return { success: false, mensagem: 'Usuário ou senha inválidos.' };
    }

    return { success: true, usuario: encontrado };
  } catch (err) {
    console.error('Erro na função login:', err);
    throw new Error('Erro inesperado ao tentar login.');
  }
}


export async function buscarProdutosPorLocalizacao(localizacao_id: number) {
  try {
    const todos = await buscarConsultaEstoque();
    return todos
      .filter((item: any) => item.localizacao_id === localizacao_id)
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
  total_produtos: number;
}

export const buscarLocalizacoes = async (
  limit: number = 100,
  offset: number = 0,
  busca: string = '',
  armazemId?: number,
  tipoId?: number,
): Promise<{ results: Localizacao[]; total: number }> => {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
      busca: encodeURIComponent(busca),
      ...(armazemId && { armazemId: armazemId.toString() }),
      ...(tipoId && { tipoId: tipoId.toString() }),
    });

    const res = await axios.get<{ results: any[]; total: number }>(
      `http://151.243.0.78:3001/localizacao?${params.toString()}`
    );

    const dados: Localizacao[] = res.data.results.map((item) => ({
      localizacao_id: item.localizacao_id,
      nome: item.nome,
      tipo: item.tipo?.tipo ?? '',
      armazem: item.armazem?.nome ?? '',
      ean: item.ean ?? '',
      total_produtos: item.total_produtos ?? 0,
    }));

    return {
      results: dados,
      total: res.data.total
    };
  } catch (err) {
    console.error('Erro ao buscar localizações →', err);
    throw new Error('Falha ao carregar as localizações do servidor.');
  }
};

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

export interface Produto {
  produto_id: number;
  url_foto: string;
  descricao: string;
  sku: string;
  ean: string;
}

export const buscarProdutos = async (): Promise<Produto[]> => {
  try {
    const res = await axios.get<{results: any[]}>('http://151.243.0.78:3001/produto?limit=1000000000000');

    const dados: Produto[] = res.data.results.map((item) => ({
      produto_id: item.produto_id,
      url_foto: item.url_foto ?? '',
      descricao: item.descricao,
      sku: item.sku,
      ean: item.ean ?? '',
    }));

    console.log(dados)

    return dados
  } catch (err) {
    console.error('Erro ao buscar localizações →', err);
    throw new Error('Falha ao carregar as localizações do servidor.');
  }
};


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
export interface ItemSeparacao {
  sku: string;
  idItem: string;
  localizacoes: any[];
  descricao?: string;
  urlFoto?: string;
}

export interface PedidoSeparado {
  numeroPedido: string;
  itens: ItemSeparacao[];
}

export interface RespostaSeparacao {
  pedidos: PedidoSeparado[];
}

export async function enviarArquivoSeparacao(formData: FormData): Promise<RespostaSeparacao> {
  try {
    const response = await axios.post(`${BASE_URL}/separacao/agrupado-pedido`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const pedidos = response.data.pedidos;

    // Buscar todos os produtos disponíveis na base para enriquecimento
    const produtosRes = await axios.get(`${BASE_URL}/produto`);
    const produtos = produtosRes.data;

    const pedidosComDescricaoFoto = pedidos.map((pedido: any) => {
      const itens = pedido.itens.map((item: any) => {
        const produtoEncontrado = produtos.find((p: any) => p.sku === item.sku);

        return {
          ...item,
          descricao: produtoEncontrado?.descricao || '',
          urlFoto: produtoEncontrado?.urlFoto || '', // ou .imagem se for esse o nome
        };
      });

      return {
        numeroPedido: pedido.numeroPedido,
        itens,
      };
    });

    return { pedidos: pedidosComDescricaoFoto };
  } catch (err) {
    console.error('Erro ao enviar arquivo de separação →', err);
    throw new Error('Falha ao processar o arquivo de separação.');
  }
}

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
  const produtos = response.data.results;

  const encontrado = produtos.find((p: any) => p.ean === ean.trim());

  if (!encontrado) {
    throw new Error('Produto com esse EAN não encontrado.');
  }

  return encontrado;
}

export async function buscarLocalizacaoPorEAN(ean: string) {
  const response = await axios.get('http://151.243.0.78:3001/localizacao');
  const localizacoes = response.data.results;

  const encontrada = localizacoes.find((l: any) => l.ean === ean.trim());

  if (!encontrada) {
    throw new Error('Localização com esse EAN não encontrada.');
  }

  return encontrada;
}

export async function buscarProdutosPorLocalizacaoDireto(localizacao_id: number) {
  const res = await axios.get(`http://151.243.0.78:3001/localizacao/${localizacao_id}/produtos`);
  console.log(
    '🔍 produtos_estoque[0]:',
    JSON.stringify(res.data.produtos_estoque[0], null, 2)
  );

  const dados = res.data?.produtos_estoque || [];

  return dados.map((item: any) => ({
    produto_estoque_id: item.produto_estoque_id,
    produto_id: item.produto?.produto_id,
    descricao: item.produto?.descricao || '',
    sku: item.produto?.sku || '',
    ean: item.produto?.ean || '',
    quantidade: item.quantidade || 0,
  }));
}

export async function buscarProdutoEstoquePorId(id: number) {
  try {
    const res = await axios.get(`http://151.243.0.78:3001/produto-estoque/${id}`);
    return res.data;
  } catch (err: any) {
    console.error(`❌ Erro ao buscar produto_estoque ID ${id}:`, err);
    return null;
  }
}


// Função para envio da movimentação
export async function enviarMovimentacao(payload: {
  tipo: 'entrada' | 'saida' | 'transferencia';
  usuario_id: number;
  localizacao_origem_id: number;
  localizacao_destino_id: number;
  itens_movimentacao: {
    produto_estoque_id: number;
    quantidade: number;
  }[];
}) {
  try {
    const { data } = await axios.post(
      'http://151.243.0.78:3001/movimentacao',
      payload
    );
    return data;
  } catch (err: any) {
    if (axios.isAxiosError(err)) {
      if (err.response) {
        console.error('❌ Status do erro:', err.response.status);
        console.error('❌ Dados da resposta:', JSON.stringify(err.response.data, null, 2));
        alert(`Erro ${err.response.status}:\n${JSON.stringify(err.response.data, null, 2)}`);
      } else if (err.request) {
        alert('Nenhuma resposta recebida do servidor.');
      } else {
        alert('Erro na configuração da requisição.');
      }
    } else {
      alert('Erro inesperado ao enviar movimentação.');
    }

    throw new Error('Falha ao enviar movimentação.');
  }
}
export async function buscarProdutoEstoquePorLocalizacaoEAN(eanLocalizacao: string, eanProduto: string) {
  try {
    const localizacao = await buscarLocalizacaoPorEAN(eanLocalizacao.trim());
    const produto = await buscarProdutoPorEAN(eanProduto.trim());

    if (!localizacao?.localizacao_id || !produto?.produto_id) {
      throw new Error('EAN inválido.');
    }

    const produtoEstoqueRes = await axios.get(`http://151.243.0.78:3001/produto-estoque`);
    const lista = produtoEstoqueRes.data;

    const encontrado = lista.find(
      (item: any) =>
        item.produto?.produto_id === produto.produto_id &&
        item.localizacao?.localizacao_id === localizacao.localizacao_id
    );

    if (!encontrado) {
      throw new Error('Produto não encontrado nesta localização.');
    }

    return {
      produto_estoque_id: encontrado.produto_estoque_id,
      localizacao_id: localizacao.localizacao_id,
      quantidade: encontrado.quantidade || 0,
    };
  } catch (err: any) {
    console.error('Erro em buscarProdutoEstoquePorLocalizacaoEAN:', err);
    throw err;
  }
}
export async function criarOcorrencia(payload: {
  usuario_id: number;
  produto_estoque_id: number;
  localizacao_id: number;
  // quantidade: number;
}) {
  try {
    const { data } = await axios.post(`${BASE_URL}/ocorrencia`, {
      usuario_id: payload.usuario_id,
      produto_estoque_id: payload.produto_estoque_id,
      localizacao_id: payload.localizacao_id,
      // quantidade: payload.quantidade,
    });

    return data; // opcional, caso queira retornar a ocorrência criada
  } catch (err: any) {
    console.error('Erro ao criar ocorrência:', err);
    throw new Error(err?.response?.data?.message || 'Erro ao registrar ocorrência.');
  }
}
export async function buscarOcorrencias(ativo?: true | false) {
  try {
    const query = ativo ? `?ativo=${ativo}` : '';
    const res = await axios.get(`${BASE_URL}/ocorrencia/listar-por-localizacao${query}`);
    console.log(res)
    console.log(res.data.map((o: any) => ({
      ocorrencias_id: o.ocorrencias.ocorrencia_id, // ou o.ocorrencia_id conforme o nome correto
      localizacao: o.localizacao || '-',
      armazem: o.armazem || '-',
      produto: o.nome_produto || '-',
      sku: o.sku || '-',
      quantidade: o.quantidade || '-',
      ativo: o.ativo,
    })))

    return res.data.map((o: any) => ({
      ocorrencias_id: o.ocorrencias.ocorrencia_id, // ou o.ocorrencia_id conforme o nome correto
      localizacao: o.localizacao || '-',
      armazem: o.armazem || '-',
      produto: o.nome_produto || '-',
      sku: o.sku || '-',
      quantidade: o.quantidade || '-',
      ativo: o.ativo,
    }));
  } catch (err) {
    console.error('Erro ao buscar ocorrências:', err);
    throw new Error('Erro ao buscar ocorrências.');
  }
}

export interface Armazem {
  armazem_id: number;
  nome: string;
}

export async function buscarArmazemPorEAN(ean: string): Promise<Armazem | null> {
  try {
    const res = await axios.get<Armazem[]>(`http://151.243.0.78:3001/armazem`, {
      params: { ean }
    });
    return res.data.length > 0 ? res.data[0] : null;
  } catch (err) {
    console.error('Erro ao buscar armazém por EAN →', err);
    return null;
  }
}
