import { api, tratarErro, salvarToken } from "./config";

// ---------- AUTENTICAÇÃO ----------
export async function login(usuario, senha) {
	try {
		// Usar o mesmo endpoint do frontend
		const response = await api.post("/auth/login", {
			usuario,
			senha,
		});

		console.log(response);

		// Se vier o token, salva automaticamente
		if (response.data && response.data.access_token) {
			await salvarToken(response.data.access_token);
			return { success: true, usuario: response.data.usuario };
		} else {
			return { success: false, message: "Token não recebido" };
		}
	} catch (error) {
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
