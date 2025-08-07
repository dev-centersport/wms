import { api, tratarErro } from "./config";

// ---------- CONSULTA DE ESTOQUE ----------
export async function buscarConsultaEstoque(termoBusca) {
	try {
		console.log("🔍 Iniciando busca com termo:", termoBusca);
		
		let todosResultados = [];
		let offset = 0;
		const limite = 30; // Limite do backend
		let temMaisResultados = true;

		// Buscar todos os resultados fazendo múltiplas requisições
		while (temMaisResultados) {
			console.log(`📥 Buscando página ${Math.floor(offset / limite) + 1} (offset: ${offset})`);
			
			let response;
			if (termoBusca) {
				response = await api.get(
					`/produto-estoque/pesquisar?show=false&search=${termoBusca}&offset=${offset}`
				);
			} else {
				response = await api.get(`/produto-estoque/pesquisar?show=false&offset=${offset}`);
			}

			const resultadosPagina = response.data.results || response.data || [];
			console.log(`📦 Resultados da página ${Math.floor(offset / limite) + 1}:`, resultadosPagina.length);

			if (resultadosPagina.length === 0) {
				// Não há mais resultados
				temMaisResultados = false;
			} else {
				todosResultados = [...todosResultados, ...resultadosPagina];
				
				// Se retornou menos que o limite, chegamos ao fim
				if (resultadosPagina.length < limite) {
					temMaisResultados = false;
				} else {
					offset += limite;
				}
			}
		}

		console.log("📦 Total de resultados carregados:", todosResultados.length);

		// Filtrar localmente se houver termo de busca
		const dadosFiltrados = termoBusca
			? todosResultados.filter((item) => {
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
			: todosResultados;

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
