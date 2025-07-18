import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { login } from '../api/loginAPI';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function LoginScreen() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const navigation = useNavigation();
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleLogin = async () => {
    if (!usuario || !senha) {
      alert('Usuário e senha são obrigatórios');
      return;
    }

    try {
      const resultado = await login(usuario, senha);
      if (resultado.success) {
        navigation.navigate('Home');
      } else {
        alert('Usuário ou senha inválidos.');
      }
    } catch (err) {
      console.log(err);
      alert('Erro ao fazer login. Verifique seus dados.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Image
              source={require('../../assets/images/logo01.png')}
              style={styles.logo}
            />
            <Text style={styles.brand}>WMS</Text>
            <Text style={styles.welcome}>Bem Vindo!</Text>

            <Text style={styles.label}>Usuário</Text>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Usuário"
                value={usuario}
                onChangeText={setUsuario}
                style={styles.input}
                placeholderTextColor="#888"
              />
              <Icon name="user" size={20} color="#888" style={styles.icon} />
            </View>

            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!mostrarSenha}
                style={styles.input}
                placeholderTextColor="#888"
              />
              <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
                <Icon
                  name={mostrarSenha ? 'eye' : 'eye-slash'}
                  size={20}
                  color="#888"
                  style={styles.icon}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleLogin} style={styles.button}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>

            <Text style={styles.footer}>
              <Text style={{ fontStyle: 'italic', fontWeight: '600' }}>
                "Otimizando a gestão de armazém com tecnologia eficiente"
              </Text>
            </Text>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#61DE25',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 10,
    borderRadius: 75,
    backgroundColor: '#4BCC1C',
    resizeMode: 'contain',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  brand: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  welcome: {
    fontSize: 16,
    marginBottom: 20,
    color: '#000',
  },
  label: {
    alignSelf: 'flex-start',
    marginLeft: '10%',
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef4ff',
    borderRadius: 6,
    paddingHorizontal: 10,
    width: '80%',
    marginTop: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  icon: {
    fontSize: 20,
    color: '#000',
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#000',
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 6,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  footer: {
    marginTop: 30,
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
});
