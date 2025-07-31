import axios from 'axios'
import Ocorrencia from '../pages/NovaOcorrencia';
import Cookies from 'js-cookie';

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

export type StatusAuditoria = 'pendente' | 'concluida' | 'em andamento';

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


    const response = await axios.get(`${BASE_URL}/auditoria`, {
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

    const response = await axios.post(
      `${BASE_URL}/auditoria/${auditoriaId}/concluir`,
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
    const res = await axios.post(`http://localhost:3001/auth/login`, {
      usuario,
      senha
    });

    // Se vier o token, salva no cookie
    if (res.data && res.data.access_token) {
      Cookies.set('token', res.data.access_token, { expires: 1 }); // expira em 1 dia
      return { status: 200, message: 'Login realizado com sucesso!' };
    } else {
      // Caso não venha o token, retorna erro genérico
      return { status: 401, message: 'Token não recebido.' };
    }
  } catch (err: any) {
    // Se a API retornar mensagem de erro, repassa para o front
    if (err.response && err.response.data && err.response.data.message) {
      return { status: err.response.status, message: err.response.data.message };
    }
    // Erro inesperado
    return { status: 500, message: 'Erro inesperado ao tentar login.' };
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
  armazem: string;
  ean: string;
  total_produtos: number;
}

export const buscarLocalizacoes = async (
  limit: number = 5000,
  offset: number = 0,
  busca: string = '',
  armazemId?: number,
  tipoId?: number,
): Promise<{ results: Localizacao[]; total: number }> => {
  try {
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

    const res = await axios.get<{ results: any[]; total: number }>(
      `http://151.243.0.78:3001/localizacao?${params.toString()}`
    );

    const dados: Localizacao[] = res.data.results.map((item) => ({
      localizacao_id: item.localizacao_id,
      nome: item.nome,
      tipo_localizacao_id: item.tipo?.tipo_localizacao_id ?? '',
      tipo: item.tipo?.tipo ?? '',
      armazem_id: item.armazem?.armazem_id ?? '',
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
    const res = await axios.get<{ results: any[] }>('http://151.243.0.78:3001/produto?limit=1000000000000');

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
    const limite = 1000;
    let offset = 0;
    let total = Infinity;

    while (todos.length < total) {
      const res = await axios.get('http://151.243.0.78:3001/produto-estoque', {
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
    const response = await axios.post(`${BASE_URL}/separacao/agrupado-produto`, formData, {
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

export async function buscarProdutoPorEAN(ean: string, eanLocalizacao?: string) {
  const eanLimpo = ean.replace(/[\n\r\t\s]/g, "").trim();

  try {
    const response = await axios.get(`http://151.243.0.78:3001/produto/buscar-por-ean/${eanLimpo}`);
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
    const response = await axios.get(`${BASE_URL}/localizacao/buscar-por-ean/${eanLimpo}`);
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
  const res = await axios.get(`http://151.243.0.78:3001/localizacao/${localizacao_id}/produtos`);

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

export async function buscarLocalizacaoGeral(ean: string) {
  const response = await axios.get('http://151.243.0.78:3001/localizacao');
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
    const { data } = await axios.post(`${BASE_URL}/ocorrencia`, {
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
    const res = await axios.get(`${BASE_URL}/ocorrencia/listar-por-localizacao${query}`);
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
    const res = await axios.get<Armazem[]>(`http://151.243.0.78:3001/armazem`, {
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
    const res = await axios.post(`${BASE_URL}/auditoria/${id}/iniciar`);
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

    const res = await axios.post(`${BASE_URL}/auditoria`, data);
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
    await axios.get(`${BASE_URL}/movimentacao/abrir-localizacao/${ean}`);
  } catch (err: any) {
    console.error('Erro ao abrir localização:', err);
    throw new Error(err?.response?.data?.message || 'Falha ao abrir localização.');
  }
}

// 🔒 Fechar localização
export async function fecharLocalizacao(ean: string): Promise<void> {
  try {
    await axios.get(`${BASE_URL}/movimentacao/fechar-localizacao/${ean}`);
  } catch (err: any) {
    console.error('Erro ao fechar localização:', err);
    throw new Error(err?.response?.data?.message || 'Falha ao fechar localização.');
  }
}

export async function buscarUsuarios() {
  const response = await axios.get(`${BASE_URL}/usuario`);
  return response.data;
}

