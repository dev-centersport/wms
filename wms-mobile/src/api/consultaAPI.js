import { api, tratarErro } from "./config";

// ---------- CONSULTA DE ESTOQUE ----------
export async function buscarConsultaEstoque(termoBusca) {
	try {
		// Usar endpoint que não requer autenticação
		const response = await api.get(`/produto-estoque`);

		const resultados = response.data.results || response.data || [];

		// Filtrar localmente se houver termo de busca
		const dadosFiltrados = termoBusca
			? resultados.filter((item) => {
					const searchTerm = termoBusca.toLowerCase();
					return (
						item.produto?.descricao?.toLowerCase().includes(searchTerm) ||
						item.produto?.sku?.toLowerCase().includes(searchTerm) ||
						item.produto?.ean?.toLowerCase().includes(searchTerm)
					);
			  })
			: resultados;

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
