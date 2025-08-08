import axios from 'axios'
import Ocorrencia from '../pages/NovaOcorrencia';
import Cookies from 'js-cookie';

const BASE_URL = 'http://151.243.0.78:3001';

const api = axios.create({
  baseURL: 'http://151.243.0.78:3001', // ou a URL da sua API
});

// Interceptor para adicionar token de autenticação automaticamente
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação e capturar novos tokens
api.interceptors.response.use(
  (response) => {
    // Captura novo token se enviado pelo backend
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      Cookies.set('token', newToken, { expires: 1 });
      console.log('Token renovado automaticamente');
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      console.log('Token expirado detectado no interceptor');
      Cookies.remove('token');
      
      // Evita redirecionamento múltiplo e deixa o componente tratar o erro
      // O redirecionamento será feito pelo ProtectedRoute ou pelos componentes
    }
    return Promise.reject(error);
  }
);

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
  conclusao?: string | null;
  data_hora_inicio?: string | null;
  data_hora_fim?: string | null; // ou data_hora_conclusao, dependendo da sua API
  status: 'pendente' | 'concluida' | 'em andamento';
  usuario: {
    usuario_id: number;
    responsavel: string;
    usuario: string;
    senha: string;
    nivel: number;
    cpf: string;
    ativo: boolean;
  };
  localizacao: {
    localizacao_id: number;
    status: string;
    nome: string;
    altura: string;
    largura: string;
    comprimento: string;
    ean: string;
  };
  ocorrencias?: Ocorrencia[];
}

export type StatusAuditoria = 'pendente' | 'concluida' | 'em andamento' | 'cancelada';

export async function buscarAuditoria(params?: {
  search?: string;
  offset?: number;
  limit?: number;
  status?: StatusAuditoria;
}) {
  try {
    const queryParams: Record<string, any> = {};

    if (params?.search) {
      queryParams.search = params.search;
    }

    queryParams.offset = String(params?.offset ?? 0);
    queryParams.limit = String(params?.limit ?? 50);

    if (
      params?.status === 'pendente' ||
      params?.status === 'concluida' ||
      params?.status === 'em andamento'
    ) {
      queryParams.status = params.status;
    }


    const response = await api.get(`/auditoria`, {
      params: queryParams,
    });

    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar auditorias:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
    }
    throw new Error('Falha ao carregar as auditorias.');
  }
}


export interface ItemAuditoriaPayload {
  produto_estoque_id: number;
  quantidade: number;
  quantidades_sistema: number;
  quantidades_fisico: number;
  motivo_diferenca: string;
  acao_corretiva: string;
  estoque_anterior: number;
  estoque_novo: number;
  mais_informacoes?: string;
}

export async function registrarConferenciaAuditoria(
  auditoriaId: number,
  conclusao: string,
  itens: ItemAuditoriaPayload[]
) {
  try {
    const payload = {
      conclusao,
      itens,
    };

    const response = await api.post(
      `/auditoria/${auditoriaId}/concluir`,
      payload
    );

    return response.data;
  } catch (err: any) {
    console.error('Erro ao concluir auditoria:', err);
    throw new Error(err?.response?.data?.message || 'Erro ao concluir auditoria.');
  }
}

export async function login(usuario: string, senha: string) {
  try {

    // Para login, usamos axios diretamente pois ainda não temos token
    const res = await axios.post(`${BASE_URL}/auth/login`, {

      usuario,
      senha
    });

    console.log('Resposta do login:', res);

    // Se vier o token, salva no cookie
    if (res.data && res.data.access_token) {
      Cookies.set('token', res.data.access_token, { expires: 1 }); // expira em 1 dia
      return { status: 200, message: 'Login realizado com sucesso!' };
    } else if (res.status === 201 && res.data) {
      return { status: 401, message: 'Usuário ou senha inválido' };
    } else {
      // Caso não venha o token, retorna erro genérico
      return { status: 401, message: 'Token não recebido.' };
    }
  } catch (err: any) {
    console.error('Erro no login:', err);
    
    // Se a API retornar mensagem de erro, repassa para o front
    if (err.response && err.response.data && err.response.data.message) {
      return { status: err.response.status, message: err.response.data.message };
    }
    
    // Se for erro de rede
    if (err.code === 'NETWORK_ERROR' || err.code === 'ERR_NETWORK') {
      return { status: 500, message: 'Erro de conexão. Verifique sua internet.' };
    }
    
    // Erro inesperado
    return { status: 500, message: 'Erro inesperado ao tentar login.' };
  }
}

// Função para buscar o perfil do usuário logado
export async function getCurrentUser() {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar perfil do usuário:', error);
    
    // Se for erro 401, significa que o token expirou ou é inválido
    if (error.response?.status === 401) {
      // Remove o token inválido
      Cookies.remove('token');
      // Redireciona para login
      window.location.href = '/login';
      throw new Error('Sessão expirada. Faça login novamente.');
    }
    
    // Se for erro de rede
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
      throw new Error('Erro de conexão. Verifique sua internet.');
    }
    
    // Outros erros
    throw new Error(error.response?.data?.message || 'Falha ao buscar perfil do usuário.');
  }
}


export async function buscarProdutosPorLocalizacao(localizacao_id: number) {
  try {
    const todos = await buscarConsultaEstoque();
    return todos
      .filter((item: any) => item.localizacao_id === localizacao_id)
      .map((item: any) => ({
        produto_id: item.produto?.produto_id ?? null,
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
  tipo_localizacao_id: number;
  armazem: string;
  armazem_id: number;
  ean: string;
  total_produtos: number;
}

export const buscarLocalizacoes = async (
  limit: number = 10000,
  offset: number = 0,
  busca: string = '',
  armazemId?: number,
  tipoId?: number,
): Promise<{ results: Localizacao[]; total: any }> => {
  try {
    console.log('Buscando localizações com parâmetros:', { limit, offset, busca, armazemId, tipoId });
    
    const params = new URLSearchParams();

    params.set('limit', String(limit));
    params.set('offset', String(offset));

    if (busca?.trim()) {
      params.set('search', busca.trim());
    }
    if (typeof armazemId === 'number') {
      params.set('armazemId', armazemId.toString());
    }
    if (typeof tipoId === 'number') {
      params.set('tipoId', tipoId.toString());
    }

    console.log('URL params:', params.toString());

    const res = await api.get<{ results: any[]; total: any }>(
      `/localizacao?${params.toString()}`
    );

    console.log('Resposta da API:', res.data);

    const dados: Localizacao[] = res.data.results.map((item) => ({
      localizacao_id: item.localizacao_id,
      nome: item.nome,
      tipo_localizacao_id: Number(item.tipo?.tipo_localizacao_id) || 0,
      tipo: item.tipo?.tipo ?? '',
      armazem_id: Number(item.armazem?.armazem_id) || 0,
      armazem: item.armazem?.nome ?? '',
      ean: item.ean ?? '',
      total_produtos: item.total_produtos ?? 0,
    }));

    console.log('Dados processados:', dados);

    return {
      results: dados,
      total: res.data.total.total_itens
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
    const res = await api.get<{ results: any[] }>(`/produto?limit=1000000000000`);

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
    const todos: any[] = [];
    const limite = 10000;
    let offset = 0;
    let total = Infinity;

    while (todos.length < total) {
      const res = await api.get('/produto-estoque', {
        params: { limit: limite, offset: offset }
      });

      const results = res.data?.results || res.data;
      const formatados = results.map((item: any) => ({
        produto_estoque_id: item.produto_estoque_id ?? null,
        produto_id: item.produto?.produto_id ?? `sem-id-${item.produto?.sku}-${item.localizacao?.localizacao_id}`,
        descricao: item.produto?.descricao || '',
        sku: item.produto?.sku || '',
        ean: item.produto?.ean || '',
        quantidade: item.quantidade || 0,
        localizacao_id: item.localizacao?.localizacao_id ?? null,
        localizacao: item.localizacao?.nome || '',
        localizacao_ean: item.localizacao?.ean,
        armazem: item.localizacao?.armazem?.nome || '',
      }));

      todos.push(...formatados);
      total = res.data?.total ?? results.length;
      offset += limite;
    }

    return todos;
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
export interface ItemAgrupadoProduto {
  urlFoto: string;
  descricao: string;
  eanProduto: string;
  quantidadeSeparada: number;
  armazem: string;
  localizacao: string;
  pedidosAtendidos: {
    pedidoId: string;
    numeroPedido: string;
  }[];
}

export interface RespostaSeparacaoProduto {
  localizacoes: ItemAgrupadoProduto[];
  produtosNaoEncontrados: any[];
}

export async function enviarArquivoSeparacaoPorProduto(formData: FormData): Promise<RespostaSeparacaoProduto> {
  try {
    const response = await api.post(`/separacao/agrupado-produto`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data as RespostaSeparacaoProduto;
  } catch (err) {
    console.error('Erro ao enviar arquivo de separação por produto →', err);
    throw new Error('Falha ao processar o arquivo de separação por produto.');
  }
}


export async function enviarArquivoSeparacao(formData: FormData): Promise<RespostaSeparacao> {
  try {
    const response = await api.post(`/separacao/agrupado-pedido`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const pedidos = response.data.pedidos;

    // Buscar todos os produtos disponíveis na base para enriquecimento
    const produtosRes = await api.get(`/produto`);
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
    const res = await api.get<Armazem[]>('/armazem');
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
    const res = await api.get<TipoLocalizacao[]>('/tipo-localizacao');

    return res.data;
  } catch (err) {
    console.error('Erro ao buscar tipos de localização →', err);
    throw new Error('Falha ao carregar os tipos de localização do servidor.');
  }
};

// Função para buscar filtros disponíveis para localizações
export const buscarFiltrosLocalizacao = async (): Promise<{
  armazens: { armazem_id: number; nome: string }[];
  tipos: { tipo_localizacao_id: number; tipo: string }[];
}> => {
  try {
    console.log('Buscando filtros de localização...');
    const [armazensRes, tiposRes] = await Promise.all([
      api.get<Armazem[]>('/armazem'),
      api.get<TipoLocalizacao[]>('/tipo-localizacao')
    ]);

    console.log('Resposta armazéns:', armazensRes.data);
    console.log('Resposta tipos:', tiposRes.data);

    const result = {
      armazens: armazensRes.data.map(a => ({ armazem_id: a.armazem_id, nome: a.nome })),
      tipos: tiposRes.data.map(t => ({ tipo_localizacao_id: t.tipo_localizacao_id, tipo: t.tipo }))
    };

    console.log('Filtros processados:', result);
    return result;
  } catch (err) {
    console.error('Erro ao buscar filtros de localização →', err);
    throw new Error('Falha ao buscar filtros de localização.');
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

    await api.post('/localizacao', {
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
    await api.delete(`/localizacao/${localizacao_id}`);
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

export async function buscarProdutoPorEAN(ean: string, eanLocalizacao?: string) {
  const eanLimpo = ean.replace(/[\n\r\t\s]/g, "").trim();

  try {
    const response = await api.get(`/produto/buscar-por-ean/${eanLimpo}`);
    const produto = response.data;

    let produto_estoque_id;

    if (eanLocalizacao) {
      try {
        const estoque = await buscarProdutoEstoquePorLocalizacaoEAN(eanLocalizacao, eanLimpo);
        produto_estoque_id = estoque?.produto_estoque_id;
      } catch {
        produto_estoque_id = undefined;
      }
    }

    return {
      produto_id: produto.produto_id,
      produto_estoque_id,
      sku: produto.sku || '',
      ean: produto.ean || '',
      descricao: produto.descricao || '',
    };
  } catch {
    throw new Error('Produto com esse EAN não encontrado.');
  }
}

export async function buscarLocalizacaoPorEAN(ean: string) {
  try {
    const eanLimpo = ean.replace(/[\n\r\t\s]/g, "").trim();
    const response = await api.get(`/localizacao/buscar-por-ean/${eanLimpo}`);
    const loc = response.data;

    if (!loc || !loc.localizacao_id) {
      throw new Error("Localização com esse EAN não encontrada.");
    }

    return {
      localizacao_id: loc.localizacao_id,
      nome: loc.nome || loc.localizacao_nome || '',
      armazem: loc.armazem_nome || '',
    };
  } catch (err) {
    console.error("Erro ao buscar localização:", err);
    throw new Error("Erro ao buscar localização.");
  }
}


export interface ProdutoEstoqueDTO {
  produto_estoque_id: number;
  produto_id: number;
  descricao: string;
  sku: string;
  ean: string;
  quantidade: number;
}

export async function buscarProdutosPorLocalizacaoDireto(localizacao_id: number): Promise<ProdutoEstoqueDTO[]> {
  const res = await api.get(`/localizacao/${localizacao_id}/produtos`);

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
    const res = await api.get(`/produto-estoque/${id}`);
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
    produto_id: number;
    quantidade: number;
    produto_estoque_id?: number;
  }[];
}) {
  try {
    const { data } = await api.post(
      '/movimentacao',
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

export async function buscarLocalizacaoGeral(ean: string) {
  const response = await api.get('/localizacao');
  const localizacoes = response.data.results;

  const encontrada = localizacoes.find((l: any) => l.ean === ean.trim());

  if (!encontrada) {
    throw new Error('Localização com esse EAN não encontrada.');
  }

  return encontrada;
}

const cacheProdutosPorLocalizacao = new Map<number, ProdutoEstoqueDTO[]>();

export async function buscarProdutoEstoquePorLocalizacaoEAN(eanLocalizacao: string, eanProduto: string) {
  try {
    const eanLoc = eanLocalizacao.replace(/[\n\r\t\s]/g, "").trim();
    const codProd = eanProduto.replace(/[\n\r\t\s]/g, "").trim();

    const localizacao = await buscarLocalizacaoPorEAN(eanLoc);
    const localizacaoID = localizacao.localizacao_id;

    let produtos = cacheProdutosPorLocalizacao.get(localizacaoID);

    if (!produtos) {
      produtos = await buscarProdutosPorLocalizacaoDireto(localizacaoID);
      cacheProdutosPorLocalizacao.set(localizacaoID, produtos);
    }

    const encontrado = produtos.find(p =>
      p &&
      (p.ean?.replace(/[\n\r\t\s]/g, "").trim() === codProd ||
        p.sku?.replace(/[\n\r\t\s]/g, "").trim() === codProd)
    );

    if (!encontrado) {
      throw new Error("Produto não encontrado nesta localização.");
    }

    return {
      produto_estoque_id: encontrado.produto_estoque_id,
      localizacao_id: localizacaoID,
      quantidade: encontrado.quantidade,
    };
  } catch (err: any) {
    console.error("Erro em buscarProdutoEstoquePorLocalizacaoEAN:", err);
    throw new Error(err?.message || "Erro ao buscar produto na localização.");
  }
}
export async function criarOcorrencia(payload: {
  usuario_id: number;
  produto_estoque_id: number;
  localizacao_id: number;
  quantidade_esperada: number;
}) {
  try {
    const { data } = await api.post(`/ocorrencia`, {
      usuario_id: payload.usuario_id,
      produto_estoque_id: payload.produto_estoque_id,
      localizacao_id: payload.localizacao_id,
      quantidade_esperada: payload.quantidade_esperada,
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
    const res = await api.get(`/ocorrencia/listar-por-localizacao${query}`);
    console.log(res)
    console.log(res.data.flatMap((o: any) =>
      o.produto.map((p: any) => ({
        localizacao: o.localizacao || '-',
        armazem: o.armazem || '-',
        produto: p.descricao || '-',
        sku: p.sku || '-',
        quantidade: p.qtd_esperada || '-',
        qtd_sistema: p.qtd_sistema || '-',
        diferenca: p.diferenca || '-',
        qtd_ocorrencias_produto: p.qtd_ocorrencias || '-',
        ativo: p.ativo,
        produto_id: p.produto_id || '-',
        ean: p.ean || '-',
        qtd_ocorrencias: p.qtd_ocorrencias || '-',
        ocorrencia_id: o.ocorrencia_id,
      }))
    ));

    return res.data.flatMap((o: any) =>
      o.produto.map((p: any) => ({
        localizacao: o.localizacao || '-',
        localizacao_id: o.localizacao_id, // ✅ Adicionado aqui
        armazem: o.armazem || '-',
        produto: p.descricao || '-',
        sku: p.sku || '-',
        quantidade: p.qtd_esperada || '-',
        qtd_sistema: p.qtd_sistema || '-',
        diferenca: p.diferenca || '-',
        qtd_ocorrencias_produto: p.qtd_ocorrencias || '-',
        ativo: p.ativo,
        produto_id: p.produto_id || '-',
        ean: p.ean || '-',
        qtd_ocorrencias: p.qtd_ocorrencias || '-',
        ocorrencia_id: o.ocorrencia_id,
      }))
    );
  } catch (err) {
    console.error('Erro ao buscar ocorrências:', err);
    throw new Error('Erro ao buscar ocorrências.');
  }
}

export async function buscarOcorrenciasDaLocalizacao(localizacaoId: number) {
  const response = await api.get(`/ocorrencia/${localizacaoId}/ocorrencias-da-localizacao`);
  return response.data;
}

export interface Armazem {
  armazem_id: number;
  nome: string;
}

export async function buscarArmazemPorEAN(ean: string): Promise<Armazem | null> {
  try {
    const res = await api.get<Armazem[]>(`/armazem`, {
      params: { ean }
    });
    return res.data.length > 0 ? res.data[0] : null;
  } catch (err) {
    console.error('Erro ao buscar armazém por EAN →', err);
    return null;
  }
}

export async function iniciarAuditoria(id: number) {
  try {
    const res = await api.post(`/auditoria/${id}/iniciar`);
    return res.data;
  } catch (err: any) {
    console.error('Erro ao iniciar auditoria:', err);
    throw new Error(err?.response?.data?.message || 'Erro ao iniciar auditoria.');
  }
}
export async function criarAuditoria(data: {
  usuario_id: number;
  localizacao_id: number;
  ocorrencias: { ocorrencia_id: number }[]; // ✅ array de objetos
}) {
  try {
    console.log('📤 Dados enviados para /auditoria:', JSON.stringify(data, null, 2));

    const res = await api.post(`/auditoria`, data);
    console.log('✅ Resposta recebida da API /auditoria:', res.data);

    return res.data;
  } catch (err: any) {
    console.error('❌ Erro ao criar auditoria:', err?.response?.data || err);
    throw new Error(err?.response?.data?.message || 'Erro ao criar auditoria.');
  }
}

// 🔓 Abrir localização
export async function abrirLocalizacao(ean: string): Promise<void> {
  try {
    await api.get(`/movimentacao/abrir-localizacao/${ean}`);
  } catch (err: any) {
    console.error('Erro ao abrir localização:', err);
    throw new Error(err?.response?.data?.message || 'Falha ao abrir localização.');
  }
}

// 🔒 Fechar localização
export async function fecharLocalizacao(ean: string): Promise<void> {
  try {
    await api.get(`/movimentacao/fechar-localizacao/${ean}`);
  } catch (err: any) {
    console.error('Erro ao fechar localização:', err);
    throw new Error(err?.response?.data?.message || 'Falha ao fechar localização.');
  }
}

export async function buscarUsuarios() {
  const response = await api.get(`/usuario`);
  return response.data;
}

// ---------- PERFIL FUNCTIONS ----------
export interface Perfil {
  perfil_id: number;
  nome: string;
  descricao?: string;
  pode_ver: boolean;
  pode_add: boolean;
  pode_edit: boolean;
  pode_delete: boolean;
  usuarios_count?: number;
}

export async function buscarPerfis(): Promise<PerfilBackend[]> {
  try {
    const response = await api.get('/perfil');
    console.log('Resposta da API para perfis:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar perfis:', error.response?.data || error.message);
    throw new Error('Falha ao carregar os perfis.');
  }
}

export async function criarPerfil(dados: {
  nome: string;
  descricao?: string;
}): Promise<PerfilBackend> {
  try {
    const response = await api.post('/perfil', dados);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao criar perfil:', error.message);
    throw new Error('Falha ao criar o perfil.');
  }
}

export async function atualizarPerfil(id: number, dados: {
  nome: string;
  descricao?: string;
}): Promise<PerfilBackend> {
  try {
    const response = await api.patch(`/perfil/${id}`, dados);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao atualizar perfil:', error.message);
    throw new Error('Falha ao atualizar o perfil.');
  }
}

export async function excluirPerfil(id: number): Promise<void> {
  try {
    await api.delete(`/perfil/${id}`);
  } catch (error: any) {
    console.error('Erro ao excluir perfil:', error.message);
    throw new Error('Falha ao excluir o perfil.');
  }
}


// Função para buscar auditoria por ID (apenas uma vez!)
export async function buscarAuditoriaPorId(auditoriaId: number) {
  try {
    const response = await api.get(`/auditoria/${auditoriaId}`);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar auditoria por ID:', error.message);
    throw new Error('Falha ao carregar a auditoria.');
  }
}

// Função para buscar produtos (ocorrências) de uma auditoria (apenas uma vez!)
export async function buscarProdutosAuditoria(auditoriaId: number) {

  try {
    const response = await api.get(`/auditoria/${auditoriaId}/listar-ocorrencias`);
    return response.data;

  } catch (error: any) {
    console.error('Erro ao cancelar auditoria:', error.message);
    throw new Error('Falha ao cancelar a auditoria.');
  }
}

// Função para cancelar auditoria
export async function cancelarAuditoria(auditoriaId: number) {
  try {
    const response = await api.post(`/auditoria/${auditoriaId}/cancelar`);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao cancelar auditoria:', error.message);
    throw new Error(error?.response?.data?.message || 'Falha ao cancelar a auditoria.');
  }
}

// ========== PERMISSÕES ==========

// Interface para permissão do backend
export interface PermissaoBackend {
  permissao_id: number;
  modulo: 'armazem' | 'tipo_localizacao' | 'localizacao' | 'movimentacao' | 'transferencia' | 'ocorrencia' | 'auditoria' | 'relatorio' | 'usuario';
  pode_incluir: boolean;
  pode_editar: boolean;
  pode_excluir: boolean;
}

// Interface para perfil do backend
export interface PerfilBackend {
  perfil_id: number;
  nome: string;
  descricao?: string;
  permissoes: PermissaoBackend[];
}

// Buscar todas as permissões disponíveis
export async function buscarPermissoes(): Promise<PermissaoBackend[]> {
  try {
    const response = await api.get('/permissao');
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar permissões:', error.message);
    throw new Error('Falha ao carregar as permissões.');
  }
}

// Buscar permissões por módulo
export async function buscarPermissoesPorModulo(modulo: string): Promise<PermissaoBackend[]> {
  try {
    const response = await api.get(`/permissao/modulo/${modulo}`);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar permissões por módulo:', error.message);
    throw new Error('Falha ao carregar as permissões do módulo.');
  }
}

// Criar permissões padrão
export async function criarPermissoesPadrao(): Promise<PermissaoBackend[]> {
  try {
    const response = await api.post('/permissao/criar-padrao');
    return response.data;
  } catch (error: any) {
    console.error('Erro ao criar permissões padrão:', error.message);
    throw new Error('Falha ao criar permissões padrão.');
  }
}

// Buscar perfil por ID com permissões
export async function buscarPerfilPorId(id: number): Promise<PerfilBackend> {
  try {
    const response = await api.get(`/perfil/${id}`);
    console.log('Resposta da API para perfil:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao buscar perfil:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      throw new Error('Perfil não encontrado.');
    }
    throw new Error('Falha ao carregar o perfil.');
  }
}

// Adicionar permissões ao perfil
export async function adicionarPermissoesAoPerfil(perfilId: number, permissaoIds: number[]): Promise<PerfilBackend> {
  try {
    const response = await api.post(`/perfil/${perfilId}/permissoes`, {
      permissao_ids: permissaoIds
    });
    return response.data;
  } catch (error: any) {
    console.error('Erro ao adicionar permissões ao perfil:', error.message);
    throw new Error('Falha ao adicionar permissões ao perfil.');
  }
}

// Remover permissões do perfil
export async function removerPermissoesDoPerfil(perfilId: number, permissaoIds: number[]): Promise<PerfilBackend> {
  try {
    const response = await api.delete(`/perfil/${perfilId}/permissoes`, {
      data: { permissao_ids: permissaoIds }
    });
    return response.data;
  } catch (error: any) {
    console.error('Erro ao remover permissões do perfil:', error.message);
    throw new Error('Falha ao remover permissões do perfil.');
  }
}

// Atualizar permissão individual
export async function atualizarPermissao(id: number, dados: {
  pode_incluir?: boolean;
  pode_editar?: boolean;
  pode_excluir?: boolean;
}): Promise<PermissaoBackend> {
  try {
    const response = await api.patch(`/permissao/${id}`, dados);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao atualizar permissão:', error.message);
    throw new Error('Falha ao atualizar permissão.');
  }
}

// Criar nova permissão
export async function criarPermissao(dados: {
  modulo: 'armazem' | 'tipo_localizacao' | 'localizacao' | 'movimentacao' | 'transferencia' | 'ocorrencia' | 'auditoria' | 'relatorio' | 'usuario';
  pode_incluir: boolean;
  pode_editar: boolean;
  pode_excluir: boolean;
}): Promise<PermissaoBackend> {
  try {
    const response = await api.post('/permissao', dados);
    return response.data;
  } catch (error: any) {
    console.error('Erro ao criar permissão:', error.message);
    throw new Error('Falha ao criar permissão.');
  }
}

// Buscar usuários por perfil
export async function buscarUsuariosPorPerfil(perfilId: number): Promise<any[]> {
  try {
    const response = await api.get('/usuario');
    const todosUsuarios = response.data;
    // Filtrar usuários que têm o perfil especificado
    return todosUsuarios.filter((usuario: any) => usuario.perfil?.perfil_id === perfilId);
  } catch (error: any) {
    console.error('Erro ao buscar usuários por perfil:', error.message);
    throw new Error('Falha ao carregar usuários do perfil.');
  }
}

// Definir permissões do perfil (apenas associar IDs, sem modificar valores globais)
export async function definirPermissoesDoPerfil(
  perfilId: number, 
  permissaoIds: number[]
): Promise<PerfilBackend> {
  try {
    // Apenas associar as permissões ao perfil (não modifica valores globais)
    const response = await api.patch(`/perfil/${perfilId}/permissoes`, {
      permissao_ids: permissaoIds
    });
    return response.data;
  } catch (error: any) {
    console.error('Erro ao definir permissões do perfil:', error.message);
    throw new Error('Falha ao definir permissões do perfil.');
  }
}


