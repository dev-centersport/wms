import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';


// dentro do componente:
const router = useRouter();

const handleLogin = () => {
  router.push("/Home"); // vai para a tela Home.tsx
}

export default function LoginScreen() {
  const router = useRouter();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  

  const handleLogin = () => {
    router.push('/home');
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <Image source={require('../assets/images/wms.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.welcome}>Bem-vindo!</Text>

        <Text style={styles.label}>Usuário</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="person" size={20} color="rgb(97, 222, 37)" style={styles.icon} />
          <TextInput
            style={styles.input}
            value={usuario}
            onChangeText={setUsuario}
            placeholder="Digite seu usuário"
            placeholderTextColor="#999"
          />
        </View>

        <Text style={styles.label}>Senha</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            placeholder="Digite sua senha"
            placeholderTextColor="#999"
            secureTextEntry={!mostrarSenha}
          />
          <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
            <Ionicons
              name={mostrarSenha ? 'eye-off' : 'eye'}
              size={20}
              color="rgb(97, 222, 37)"
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          "Otimizando a gestão de armazém com tecnologia eficiente"
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(97, 222, 37)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBox: {
    backgroundColor: 'transparent',
    padding: 24,
    borderRadius: 18,
    width: '85%',
    borderWidth: 3,
    borderColor: 'white',
    alignItems: 'center',
  },
  logo: {
    width: '80%',
    height: 100,
    marginBottom: 16,
  },
  welcome: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#000',
  },
  icon: {
    paddingHorizontal: 8,
  },
  button: {
    width: '100%',
    backgroundColor: '#1e1e1e',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    marginTop: 20,
    fontStyle: 'italic',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});