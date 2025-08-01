import React, { useState, useEffect, useRef } from 'react';
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
  Keyboard,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { login } from '../api/loginAPI';
import Icon from 'react-native-vector-icons/FontAwesome';
import { removerToken } from '../api/config';

export default function LoginScreen() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const navigation = useNavigation();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [tecladoAtivo, setTecladoAtivo] = useState(false);

  const scrollRef = useRef(null);
  const usuarioInputRef = useRef(null);
  const senhaInputRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    const show = Keyboard.addListener('keyboardDidShow', () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTecladoAtivo(true);
    });

    const hide = Keyboard.addListener('keyboardDidHide', () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTecladoAtivo(false);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const handleLogin = async () => {
    if (!usuario || !senha) {
      alert('Usuário e senha são obrigatórios');
      return;
    }

    try {
      // Limpar token anterior antes de fazer novo login
      await removerToken();
      
      const resultado = await login(usuario, senha);
      if (resultado.success) {
        navigation.navigate('Home');
      } else {
        alert(resultado.message || 'Usuário ou senha inválidos.');
      }
    } catch (err) {
      console.error("❌ Erro no login:", err);
      alert('Erro ao fazer login. Verifique seus dados.');
    }
  };

  const handleUsuarioSubmit = () => {
    senhaInputRef.current?.focus();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          tecladoAtivo ? styles.scrollComTeclado : styles.scrollSemTeclado,
        ]}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
        style={Platform.OS === 'web' ? { flex: 1 } : undefined}
      >
        <Image
          source={require('../../assets/images/logo01.png')}
          style={[styles.logo, tecladoAtivo && styles.logoPequena]}
        />
        <Text style={styles.brand}>WMS</Text>
        <Text style={styles.welcome}>Bem Vindo!</Text>

        <Text style={styles.label}>Usuário</Text>
        <View style={styles.inputContainer}>
          <TextInput
            ref={usuarioInputRef}
            placeholder="Usuário"
            value={usuario}
            onChangeText={setUsuario}
            style={styles.input}
            placeholderTextColor="#888"
            returnKeyType="next"
            onSubmitEditing={handleUsuarioSubmit}
            blurOnSubmit={false}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Icon name="user" size={20} color="#888" style={styles.icon} />
        </View>

        <Text style={styles.label}>Senha</Text>
        <View style={styles.inputContainer}>
          <TextInput
            ref={senhaInputRef}
            placeholder="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!mostrarSenha}
            style={styles.input}
            placeholderTextColor="#888"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            autoCapitalize="none"
            autoCorrect={false}
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
            &ldquo;Otimizando a gestão de armazém com tecnologia eficiente&rdquo;
          </Text>
        </Text>
      </ScrollView>
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
    paddingHorizontal: 20,
  },
  scrollSemTeclado: {
    justifyContent: 'center',
    paddingVertical: 40,
  },
  scrollComTeclado: {
    justifyContent: 'flex-start',
    paddingTop: 60,
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
  logoPequena: {
    width: 90,
    height: 90,
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
    paddingBottom: 20,
  },
});
