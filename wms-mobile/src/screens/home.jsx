
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../constants/Colors';
import { obterDadosUsuario } from '../api/homeAPI';

const { width } = Dimensions.get('window');

// Constantes de estilo que faltavam
const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
};

const Spacing = {
  sm: 8,
  md: 16,
  lg: 24,
};

export default function HomeScreen({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDadosUsuario();
  }, []);

  const carregarDadosUsuario = async () => {
    try {
      const dadosUsuario = await obterDadosUsuario();
      setUsuario(dadosUsuario);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setCarregando(false);
    }
  };

  const menuItems = [
    {
      id: 'movimentacao',
      title: 'MOVIMENTAÇÃO',
      subtitle: 'Entrada e saída de produtos',
      icon: 'truck-delivery',
      color: Colors.light.primary || '#61DE25',
      onPress: () => navigation.navigate('Movimentacao'),
    },
    {
      id: 'ocorrencia',
      title: 'OCORRÊNCIA',
      subtitle: 'Registrar divergências',
      icon: 'alert-circle',
      color: Colors.light.warning || '#FFA500',
      onPress: () => navigation.navigate('Ocorrencia'),
    },
    {
      id: 'consulta',
      title: 'CONSULTA',
      subtitle: 'Consultar estoque',
      icon: 'magnify',
      color: Colors.light.info || '#007BFF',
      onPress: () => navigation.navigate('Consulta'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Barra superior com a logo do WMS */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={require('../../assets/images/logo01.png')}
            style={styles.logo}
          />
          <View style={[styles.headerText, {marginTop: 30}]}>
            <Text style={styles.brand}>WMS</Text>
            <Text style={styles.subtitle}>Warehouse Management System</Text>
          </View>
        </View>
      </View>

      {/* Barra de informações do usuário */}
      {!carregando && usuario && (
        <View style={styles.userInfoBar}>
          <Icon name="account-circle" size={20} color="#fff" style={styles.userIcon} />
          <Text style={styles.userInfoText}>
            {usuario.responsavel || usuario.usuario} • {usuario.perfil}
          </Text>
        </View>
      )}

      {/* Conteúdo principal */}
      <View style={[styles.content, { marginTop: 10 }]}>
        {/* Cards de menu */}
        <View style={[styles.menuContainer, { marginTop: 100 }]}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuCard,
                {
                  marginTop: index === 0 ? 0 : Spacing.md,
                  marginBottom: Spacing.md,
                },
              ]}
              onPress={item.onPress}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                <Icon name={item.icon} size={32} color="#fff" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>
              <Icon
                name="chevron-right"
                size={24}
                color="#888"
                style={styles.arrowIcon}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer informativo */}
        <View style={[styles.footer, { marginBottom: 30}]}>
          <Text style={styles.footerText}>
            Sistema de Gestão de Armazém
          </Text>
          <Text style={styles.footerSubtext}>
            Versão Mobile
          </Text>
        </View>
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
  userInfoBar: {
    backgroundColor: '#6c757d',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  userIcon: {
    marginRight: Spacing.sm,
  },
  userInfoText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    marginLeft: 10,
  },
  brand: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 12,
    color: '#000',
    opacity: 0.8,
  },
  menuContainer: {
    width: '100%',
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    ...Shadows.small,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  arrowIcon: {
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: '#666',
  },
});
