import { api, tratarErro } from "./config";

// ---------- CONSULTA DE ESTOQUE ----------
export async function buscarConsultaEstoque(termoBusca) {
	try {
		// Usar endpoint de pesquisa que suporta busca por EAN da localização
		const response = await api.get(`/produto-estoque/pesquisar`, {
			params: {
				search: termoBusca,
				show: 'true' // Para mostrar resultados mesmo sem busca
			}
		});

		const resultados = response.data.results || response.data || [];

		// Se não há termo de busca, retornar array vazio para mostrar EmptyState
		if (!termoBusca || termoBusca.trim().length < 2) {
			return [];
		}

		return resultados.map((item) => ({
			produto_id: item.produto?.produto_id,
			localizacao_id: item.localizacao?.localizacao_id ?? null,
			descricao: item.produto?.descricao || "",
			sku: item.produto?.sku || "",
			ean: item.produto?.ean || "",
			armazem: item.localizacao?.armazem?.nome || "",
			localizacao: item.localizacao?.nome || "",
			quantidade: item.quantidade || 0,
		}));
	} catch (error) {
		throw tratarErro(error, "Consulta de estoque");
	}
}
