import { api, tratarErro } from "./config";

export async function obterDadosUsuario() {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    throw tratarErro(error, "Obter dados do usuário");
  }
} 