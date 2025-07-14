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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { login } from '../api/index';

export default function LoginScreen() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const navigation = useNavigation();

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
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Image
            source={require('../../assets/images/logo01.png')}
            style={styles.logo}
          />
          <Text style={styles.brand}>WMS</Text>
          <Text style={styles.welcome}>Bem Vindo!</Text>

          {/* Usuário */}
          <Text style={styles.label}>Usuário</Text>
          <TextInput
            placeholder="Usuário"
            value={usuario}
            onChangeText={setUsuario}
            style={styles.input}
            placeholderTextColor="#888"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Senha com olho */}
          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!senhaVisivel}
              style={styles.inputSenha}
              placeholderTextColor="#888"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setSenhaVisivel(!senhaVisivel)} style={styles.eyeButton}>
              <Ionicons
                name={senhaVisivel ? 'eye-off' : 'eye'}
                size={22}
                color="#555"
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
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#61DE25',
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
  input: {
    width: '80%',
    backgroundColor: '#f1f1f1',
    padding: 12,
    borderRadius: 6,
    marginTop: 5,
    fontSize: 16,
    color: '#000',
  },
  inputWrapper: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 6,
    marginTop: 5,
    paddingHorizontal: 10,
  },
  inputSenha: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  eyeButton: {
    padding: 6,
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
