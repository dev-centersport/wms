
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair do sistema?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );

  };

  return (
    <View style={styles.container}>
      {/* Barra superior com a logo do WMS */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/wms.png')}
          style={styles.logo}
        />
        
        {/* Informações do usuário */}
        {user && (
          <View style={styles.userInfo}>
            <Text style={styles.userText}>Usuário: {user.usuario}</Text>
            <Text style={styles.userText}>Perfil: {user.perfil}</Text>
          </View>
        )}
        
        {/* Botão de logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="sign-out" size={20} color="#000" />
        </TouchableOpacity>
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
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 10,
    position: 'relative',
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  userInfo: {
    position: 'absolute',
    top: 50,
    left: 20,
    alignItems: 'flex-start',
  },
  userText: {
    fontSize: 12,
    color: '#000',
    fontWeight: 'bold',
  },
  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
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
