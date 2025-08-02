import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ===== CONFIGURAÇÃO BÁSICA =====
export const BASE_URL = "http://151.243.0.78:3001";

// ===== INSTÂNCIA DO AXIOS =====
export const api = axios.create({
	baseURL: BASE_URL,
	timeout: 10000,
});

// ===== INTERCEPTORS PARA AUTENTICAÇÃO =====

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
	async (config) => {
		try {
			const token = await AsyncStorage.getItem("token");
			if (token) {
				config.headers.Authorization = `Bearer ${token}`;
			}
			console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`);
		} catch (error) {
			console.error("❌ Erro ao obter token:", error);
		}
		return config;
	},
	(error) => {
		console.error("❌ Erro na requisição:", error);
		return Promise.reject(error);
	}
);

// Interceptor para tratar respostas e renovação de token
api.interceptors.response.use(
	(response) => {
		// Captura novo token se enviado pelo backend
		const newToken = response.headers["x-new-token"];
		if (newToken) {
			AsyncStorage.setItem("token", newToken)
				.then(() => {
					console.log("✅ Token renovado automaticamente");
				})
				.catch((error) => {
					console.error("❌ Erro ao salvar novo token:", error);
				});
		}
		console.log(
			`✅ ${response.status} ${response.config.method?.toUpperCase()} ${
				response.config.url
			}`
		);
		return response;
	},
	async (error) => {
		if (error.response?.status === 401) {
			// Token expirado ou inválido
			try {
				await AsyncStorage.removeItem("token");
				console.log("🔒 Token removido - usuário deslogado");

				// Adicionar navegação para tela de login
				// Você precisará implementar um sistema de navegação global
				// ou usar um callback para redirecionar para login
			} catch (storageError) {
				console.error("❌ Erro ao remover token:", storageError);
			}
		}
		console.error("❌ Erro na resposta:", {
			status: error.response?.status,
			message: error.response?.data?.message || error.message,
			url: error.config?.url,
		});
		return Promise.reject(error);
	}
);

// ===== FUNÇÃO PARA LIMPAR CÓDIGOS =====
export const limparCodigo = (valor) => {
	if (!valor) return "";
	return valor.replace(/[\n\r\t\s]/g, "").trim();
};

// ===== FUNÇÃO PARA TRATAR ERROS =====
export const tratarErro = (error, contexto = "Operação") => {
	const mensagem =
		error?.response?.data?.message ||
		error?.message ||
		`Erro ao executar ${contexto}`;
	console.error(`❌ ${contexto}:`, error);
	throw new Error(mensagem);
};

// ===== FUNÇÕES DE AUTENTICAÇÃO =====

/**
 * Salva o token no AsyncStorage
 * @param {string} token - Token de autenticação
 */
export const salvarToken = async (token) => {
	try {
		await AsyncStorage.setItem("token", token);
		console.log("✅ Token salvo com sucesso");
	} catch (error) {
		console.error("❌ Erro ao salvar token:", error);
	}
};

/**
 * Remove o token do AsyncStorage
 */
export const removerToken = async () => {
	try {
		await AsyncStorage.removeItem("token");
		console.log("✅ Token removido com sucesso");
	} catch (error) {
		console.error("❌ Erro ao remover token:", error);
	}
};

/**
 * Verifica se existe um token válido
 * @returns {Promise<boolean>} - Se existe token
 */
export const verificarToken = async () => {
	try {
		const token = await AsyncStorage.getItem("token");
		return !!token;
	} catch (error) {
		console.error("❌ Erro ao verificar token:", error);
		return false;
	}
};
