import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  ScrollView,
  Keyboard,
  Dimensions,
  SafeAreaView,
  Animated,
  Alert,
  KeyboardAvoidingView,
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
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [tecladoAtivo, setTecladoAtivo] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const navigation = useNavigation();

  const scrollRef = useRef(null);
  const usuarioInputRef = useRef(null);
  const senhaInputRef = useRef(null);
  
  // Variáveis animadas
  const logoScale = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    const show = Keyboard.addListener('keyboardDidShow', () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTecladoAtivo(true);
      Animated.timing(logoScale, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    const hide = Keyboard.addListener('keyboardDidHide', () => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTecladoAtivo(false);
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

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
      Alert.alert('Campos obrigatórios', 'Usuário e senha são obrigatórios');
      return;
    }

    setCarregando(true);

    try {
      // Limpar token anterior antes de fazer novo login
      await removerToken();

      const resultado = await login(usuario, senha);

      if (resultado.success) {
        navigation.navigate('Home');
      } else {
        Alert.alert('Erro no login', resultado.message || 'Usuário ou senha inválidos.');
      }
    } catch (err) {
      console.error("❌ Erro no login:", err);
      Alert.alert('Erro de conexão', 'Verifique sua conexão e tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  const handleUsuarioSubmit = () => {
    senhaInputRef.current?.focus();
  };

  const handleSenhaSubmit = () => {
    handleLogin();
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
        <Animated.Image
          source={require('../../assets/images/logo01.png')}
          style={[styles.logo, tecladoAtivo && styles.logoPequena, { transform: [{ scale: logoScale }] }]}
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
            placeholder="Digite sua senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!mostrarSenha}
            style={styles.input}
            placeholderTextColor="#888"
            returnKeyType="done"
            onSubmitEditing={handleSenhaSubmit}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
          />
          <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
            <Icon
              name={mostrarSenha ? 'eye' : 'eye-slash'}
              size={20}
              color="#888"
              style={styles.olhinho}
            />
          </TouchableOpacity>
        </View>

        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            onPress={handleLogin}
            style={[styles.button, carregando && styles.buttonDisabled]}
            disabled={carregando}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {carregando ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.footer}>
          <Text style={styles.footerText}>
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
    paddingTop: 40,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
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
    width: 100,
    height: 100,
  },
  brand: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  welcome: {
    fontSize: 16,
    marginBottom: 30,
    color: '#000',
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
    maxWidth: 320,
  },
  label: {
    alignSelf: 'flex-start',
    fontWeight: 'bold',
    color: '#000',
    marginTop: 15,
    marginBottom: 8,
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 15,
  },
  icon: {
    marginLeft: 10,
  },
  eyeButton: {
    padding: 5,
    marginLeft: 5,
  },
  olhinho: {
    marginLeft: 12,
    marginBottom: 2, // leve margem inferior
    fontSize: 20,
    color: '#888',
  },
  button: {
    backgroundColor: '#000',
    marginTop: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#666',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '600',
    lineHeight: 20,
  },
});
