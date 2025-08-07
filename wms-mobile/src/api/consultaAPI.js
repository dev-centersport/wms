import { api, tratarErro } from "./config";

// ---------- CONSULTA DE ESTOQUE ----------
export async function buscarConsultaEstoque(termoBusca) {
	try {
		let response;

		// Usar endpoint que não requer autenticação
		if (termoBusca) {
			response = await api.get(
				`/produto-estoque/pesquisar?show=false&search=${termoBusca}`
			);
		} else {
			response = await api.get(`/produto-estoque/pesquisar?show=false`);
		}

		const resultados = response.data.results || response.data || [];
		console.log(resultados);

		// Não aplicar filtragem local quando já há termo de busca na API
		// A API já deveria retornar os resultados filtrados
		const dadosFiltrados = resultados;

		console.log(dadosFiltrados);
		return dadosFiltrados.map((item) => ({
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
