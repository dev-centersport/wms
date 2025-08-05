import { api, tratarErro } from "./config";

// ---------- CONSULTA DE ESTOQUE ----------
export async function buscarConsultaEstoque(termoBusca) {
	try {
		console.log("🔍 Iniciando busca com termo:", termoBusca);
		
		// Usar endpoint que não requer autenticação
		const response = await api.get(`/produto-estoque`);

		const resultados = response.data.results || response.data || [];
		console.log("📦 Total de resultados brutos:", resultados.length);

		// Filtrar localmente se houver termo de busca
		const dadosFiltrados = termoBusca
			? resultados.filter((item) => {
					const searchTerm = termoBusca.toLowerCase();
					
					// Buscar por: produto (descrição, SKU, EAN) OU localização (nome, EAN)
					const matchProduto = 
						item.produto?.descricao?.toLowerCase().includes(searchTerm) ||
						item.produto?.sku?.toLowerCase().includes(searchTerm) ||
						item.produto?.ean?.toLowerCase().includes(searchTerm);
					
					const matchLocalizacao = 
						item.localizacao?.nome?.toLowerCase().includes(searchTerm) ||
						item.localizacao?.ean?.toLowerCase().includes(searchTerm) ||
						item.localizacao?.localizacao_id?.toString().includes(searchTerm);
					
					return matchProduto || matchLocalizacao;
			  })
			: resultados;

		console.log("✅ Resultados filtrados:", dadosFiltrados.length);

		return dadosFiltrados.map((item) => ({
			produto_id: item.produto?.produto_id,
			localizacao_id: item.localizacao?.localizacao_id ?? null,
			descricao: item.produto?.descricao || "",
			sku: item.produto?.sku || "",
			ean: item.produto?.ean || "",
			ean_localizacao: item.localizacao?.ean || "", // Adicionando EAN da localização
			armazem: item.localizacao?.armazem?.nome || "",
			localizacao: item.localizacao?.nome || "",
			quantidade: item.quantidade || 0,
		}));
	} catch (error) {
		console.error("❌ Erro na consulta:", error);
		throw tratarErro(error, "Consulta de estoque");
	}
}
