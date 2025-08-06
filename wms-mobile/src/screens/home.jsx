import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { obterUsuarioLogado } from '../api/usuarioAPI';
import UserInfoBar from '../componentes/Home/UserInfoBar';

export default function HomeScreen({ navigation }) {
  const [usuario, setUsuario] = useState({
    usuario_id: 0,
    responsavel: "Usuário",
    usuario: "usuario",
    perfil: "Sem perfil",
    nivel: 0,
    ativo: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarUsuario();
  }, []);

  const carregarUsuario = async () => {
    try {
      setLoading(true);
      console.log("🔄 Iniciando carregamento do usuário...");
      
      const dadosUsuario = await obterUsuarioLogado();
      console.log("✅ Dados do usuário carregados:", dadosUsuario);
      
      setUsuario(dadosUsuario);
    } catch (error) {
      console.error('❌ Erro ao carregar usuário:', error);
      // Mantém os dados padrão em caso de erro
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Barra superior com a logo do WMS */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/wms.png')}
          style={styles.logo}
        />
      </View>

      {/* Barra de informações do usuário - sempre visível */}
      {!loading && <UserInfoBar usuario={usuario} />}

      {/* Botões principais */}
      <TouchableOpacity
        style={[styles.button, { marginTop: 100 }]} // Margem fixa já que a barra sempre aparece
        onPress={() => navigation.navigate('Movimentacao')}
      >
        <Text style={styles.buttonText}>MOVIMENTAÇÃO</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Ocorrencia')}
      >
        <Text style={styles.buttonText}>OCORRÊNCIA</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Consulta')}
      >
        <Text style={styles.buttonText}>CONSULTA</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingTop: 0,
  },
  header: {
    backgroundColor: '#61DE25',
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  button: {
    backgroundColor: '#61DE25',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 20,
    color: '#000',
    fontWeight: 'bold',
  },
});
