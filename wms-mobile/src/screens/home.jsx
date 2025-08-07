
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();

  // Garante que sempre temos dados válidos
  const dadosUsuario = {
    responsavel: user?.usuario || "Usuário",
    perfil: user?.perfil || "Sem perfil",
  };

  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            await logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
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
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={26} color="#000000" />
        </TouchableOpacity>
      </View>

      {/* Informações do usuário - versão simples */}
      <View style={styles.userInfo}>
        <Text style={styles.userText}>{dadosUsuario.responsavel}</Text>
        <Text style={styles.perfilText}>{dadosUsuario.perfil}</Text>
      </View>

      {/* Container dos botões principais */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Movimentacao')}
        >
          <Ionicons name="swap-horizontal" size={28} color="#000000" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>MOVIMENTAÇÃO</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Ocorrencia')}
        >
          <Ionicons name="warning" size={28} color="#000000" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>OCORRÊNCIA</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Consulta')}
        >
          <Ionicons name="search" size={28} color="#000000" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>CONSULTA</Text>
        </TouchableOpacity>
      </View>

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
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 45,
    paddingBottom: 15,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  logo: {
    width: 65,
    height: 65,
    resizeMode: 'contain',
  },
  logoutButton: {
    position: 'absolute',
    top: 53,
    right: 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  button: {
    backgroundColor: '#61DE25',
    paddingVertical: 25,
    paddingHorizontal: 40,
    borderRadius: 15,
    marginVertical: 15,
    width: '85%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  buttonText: {
    fontSize: 18,
    color: '#000',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 12,
  },
  userInfo: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
  },
  userText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
  perfilText: {
    fontSize: 14,
    color: '#404040',
    marginTop: 2,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 120,
  },
  buttonIcon: {
    marginBottom: 5,
  },
});
