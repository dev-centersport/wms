import { api, limparCodigo, tratarErro } from "./config";

// 🔍 Buscar produto por EAN
export async function buscarProdutoPorEAN(ean) {
	try {
		const eanLimpo = limparCodigo(ean);
		const response = await api.get(`/produto/buscar-por-ean/${eanLimpo}`);
		const produto = response.data;

		if (!produto) {
			throw new Error("Produto não encontrado.");
		}

		return produto;
	} catch (error) {
		throw tratarErro(error, "Busca de produto por EAN");
	}
}

export async function buscarLocalizacaoPorEAN(ean) {
	try {
		const eanLimpo = limparCodigo(ean);
		const response = await api.get(`/localizacao/buscar-por-ean/${eanLimpo}`);
		const localizacao = response.data;

		if (!localizacao) {
			throw new Error("Localização não encontrada.");
		}

		return {
			localizacao_id: localizacao.localizacao_id,
			nome: localizacao.localizacao_nome,
			armazem: localizacao.armazem_nome || "",
		};
	} catch (error) {
		throw tratarErro(error, "Busca de localização por EAN");
	}
}

// 🚚 Enviar movimentação (entrada / saída)
export async function enviarMovimentacao(payload) {
	try {
		const { data } = await api.post("/movimentacao", payload);
		return data;
	} catch (error) {
		throw tratarErro(error, "Envio de movimentação");
	}
}

export async function buscarProdutosPorLocalizacaoDireto(localizacao_id) {
	try {
		const res = await api.get(`/localizacao/${localizacao_id}/produtos`);
		const dados = res.data?.produtos_estoque || [];

		return dados.map((item) => ({
			produto_estoque_id: item.produto_estoque_id,
			produto_id: item.produto?.produto_id,
			descricao: item.produto?.descricao || "",
			sku: item.produto?.sku || "",
			ean: item.produto?.ean || "",
			quantidade: item.quantidade || 0,
		}));
	} catch (error) {
		throw tratarErro(error, "Busca de produtos por localização");
	}
}

export async function abrirLocalizacao(ean) {
	try {
		const res = await api.get(`/movimentacao/abrir-localizacao/${ean}`);
		return res.data;
	} catch (error) {
		throw tratarErro(error, "Abertura de localização");
	}
}

export async function fecharLocalizacao(ean) {
	try {
		const res = await api.get(`/movimentacao/fechar-localizacao/${ean}`);
		return res.data;
	} catch (error) {
		throw tratarErro(error, "Fechamento de localização");
	}
}

export async function obterUsuarioLogado() {
	try {
	  const response = await api.get('/auth/profile');
	  return response.data;
	} catch (error) {
	  throw error;
	}
}
  