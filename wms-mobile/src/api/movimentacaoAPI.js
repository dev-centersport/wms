import axios from "axios";

const BASE_URL = "http://151.243.0.78:3001";

// 🔍 Buscar produto por EAN
export async function buscarProdutoPorEAN(ean) {
	const eanLimpo = ean.replace(/[\n\r\t\s]/g, "").trim();
	const response = await axios.get(
		`${BASE_URL}/produto/buscar-por-ean/${eanLimpo}`
	);
	const localizacao = response.data;

	if (!localizacao) {
		throw new Error("Localização com esse EAN não encontrado.");
	}

	return localizacao;
}

export async function buscarLocalizacaoPorEAN(ean) {
	const eanLimpo = ean.replace(/[\n\r\t\s]/g, "").trim();
	const response = await axios.get(
		`${BASE_URL}/localizacao/buscar-por-ean/${eanLimpo}`
	);
	const localizacao = response.data;

	if (!localizacao) {
		throw new Error("Localização com esse EAN não encontrada.");
	}

	return {
		localizacao_id: localizacao.localizacao_id,
		nome: localizacao.localizacao_nome, // Corrigido
		armazem: localizacao.armazem_nome || "", // Corrigido
	};
}

// 🚚 Enviar movimentação (entrada / saída)
export async function enviarMovimentacao(payload) {
	try {
		console.log('✅ Payload sendo enviado:', JSON.stringify(payload, null, 2));
		const { data } = await axios.post(`${BASE_URL}/movimentacao`, payload);
		return data;
	} catch (err) {
		console.error('❌ Erro ao salvar movimentação:', err);
		if (err.response?.data) {
			console.error('🔍 Detalhe do erro:', JSON.stringify(err.response.data, null, 2));
		}
		Alert.alert('Erro ao salvar movimentação');
	}
}


export async function buscarProdutosPorLocalizacaoDireto(localizacao_id) {
	const res = await axios.get(
		`http://151.243.0.78:3001/localizacao/${localizacao_id}/produtos`
	);
	console.log(
		"🔍 produtos_estoque[0]:",
		JSON.stringify(res.data.produtos_estoque[0], null, 2)
	);

	const dados = res.data?.produtos_estoque || [];

	return dados.map((item) => ({
		produto_estoque_id: item.produto_estoque_id,
		produto_id: item.produto?.produto_id,
		descricao: item.produto?.descricao || "",
		sku: item.produto?.sku || "",
		ean: item.produto?.ean || "",
		quantidade: item.quantidade || 0,
	}));
}
