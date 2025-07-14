import axios from 'axios';

const BASE_URL = 'http://151.243.0.78:3001';

export async function login(usuario, senha) {
  try {
    const response = await axios.get(`${BASE_URL}/usuario`);
    const usuarios = response.data; 
    // console.log(usuarios)

//aaaa
    const encontrado = usuarios.find(
      (u) => u.usuario === usuario && u.senha === senha
    );
    console.log(encontrado)

    // if (!encontrado) {
    //   return { success: false };
    // }

    return { success: true, usuario: encontrado };
  } catch (err) {
    console.error('Erro na autenticação:', err);
    throw err;
  }
}
