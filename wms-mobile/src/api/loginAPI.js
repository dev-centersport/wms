import { api, tratarErro, salvarToken } from "./config";

// ---------- AUTENTICAÇÃO ----------
export async function login(usuario, senha) {
	try {
		// Remover espaços dos parâmetros
		const usuarioLimpo = usuario.trim();
		const senhaLimpa = senha.trim();

		console.log("🔐 Tentando login para usuário:", usuarioLimpo);

		// Usar o mesmo endpoint do frontend
		const response = await api.post("/auth/login", {
			usuario: usuarioLimpo,
			senha: senhaLimpa,
		});

		console.log("📡 Resposta do login:", {
			status: response.status,
			hasToken: !!response.data?.access_token,
			tokenLength: response.data?.access_token?.length,
		});

		// Se vier o token, salva automaticamente
		if (response.data && response.data.access_token) {
			await salvarToken(response.data.access_token);
			console.log("✅ Login realizado com sucesso");
			return { success: true, usuario: response.data.usuario };
		} else {
			console.log("❌ Token não recebido na resposta");
			return { success: false, message: "Token não recebido" };
		}
	} catch (error) {
		console.error("❌ Erro no login:", {
			status: error.response?.status,
			message: error.response?.data?.message || error.message,
			config: error.config,
		});

		// Se a API retornar mensagem de erro, repassa para o front
		if (error.response && error.response.data && error.response.data.message) {
			return {
				success: false,
				message: error.response.data.message,
			};
		}
		// Erro inesperado
		throw tratarErro(error, "Autenticação");
	}
}
