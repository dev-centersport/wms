import { api, tratarErro } from "./config";

// 👤 Obter informações do usuário logado
export async function obterUsuarioLogado() {
	try {
		console.log("👤 Buscando informações do usuário logado...");
		
		// Tenta obter o perfil básico do usuário
		const profileResponse = await api.get('/auth/profile');
		console.log("📦 Dados do profile:", JSON.stringify(profileResponse.data, null, 2));
		
		const profileData = profileResponse.data;
		
		// Se temos dados do profile, usa eles
		if (profileData && profileData.usuario) {
			console.log("✅ Usando dados do profile");
			return {
				usuario_id: profileData.sub || 0,
				responsavel: profileData.usuario || "Usuário",
				usuario: profileData.usuario || "",
				perfil: profileData.perfil || "Sem perfil",
				nivel: 0,
				ativo: true,
			};
		}
		
		// Se não temos dados válidos, retorna dados padrão
		console.log("⚠️ Dados do profile inválidos, usando dados padrão");
		return {
			usuario_id: 0,
			responsavel: "Usuário",
			usuario: "usuario",
			perfil: "Sem perfil",
			nivel: 0,
			ativo: false,
		};
		
	} catch (error) {
		console.error("❌ Erro ao obter usuário logado:", error);
		console.log("📋 Detalhes do erro:", {
			status: error.response?.status,
			message: error.response?.data?.message || error.message,
			url: error.config?.url,
		});
		
		// Em caso de erro, retorna dados padrão
		return {
			usuario_id: 0,
			responsavel: "Usuário",
			usuario: "usuario",
			perfil: "Sem perfil",
			nivel: 0,
			ativo: false,
		};
	}
} 