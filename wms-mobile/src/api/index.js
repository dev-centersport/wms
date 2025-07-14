import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.2.41:3001', // coloque o IP/host da sua API
  timeout: 5000,
});

export async function login(usuario, senha) {
  try {
    const response = await api.post('/login', {
      username: usuario,
      password: senha,
    });
    return response.data;
  } catch (error) {
    console.error('Erro no login →', error.response?.data || error.message);
    throw new Error('Falha ao fazer login.');
  }
}



export default api;
