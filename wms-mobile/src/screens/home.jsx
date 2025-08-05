import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Shadows, BorderRadius, Spacing } from '../../constants/Colors';
import { obterDadosUsuario } from '../api/homeAPI';

const { width } = Dimensions.get('window');

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
      color: Colors.light.primary,
      onPress: () => navigation.navigate('Movimentacao'),
    },
    {
      id: 'ocorrencia',
      title: 'OCORRÊNCIA',
      subtitle: 'Registrar divergências',
      icon: 'alert-circle',
      color: Colors.light.warning,
      onPress: () => navigation.navigate('Ocorrencia'),
    },
    {
      id: 'consulta',
      title: 'CONSULTA',
      subtitle: 'Consultar estoque',
      icon: 'magnify',
      color: Colors.light.info,
      onPress: () => navigation.navigate('Consulta'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header moderno */}
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
          <Icon name="account-circle" size={20} color={Colors.light.textInverse} style={styles.userIcon} />
          <Text style={styles.userInfoText}>
            {usuario.responsavel || usuario.usuario} • {usuario.perfil}
          </Text>
        </View>
      )}

      {/* Conteúdo principal */}
      <View style={styles.content} marginTop={10}>
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
                <Icon name={item.icon} size={32} color={Colors.light.textInverse} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>
              <Icon
                name="chevron-right"
                size={24}
                color={Colors.light.textTertiary}
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
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.primary,
    paddingTop: 50,
    paddingBottom: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    zIndex: 2,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.light.primaryDark,
    resizeMode: 'contain',
    marginRight: Spacing.md,
    ...Shadows.small,
  },
  headerText: {
    flex: 1,
  },
  brand: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.textInverse,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.light.textInverse,
    opacity: 0.8,
    marginTop: 2,
  },
  headerDecoration: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  menuContainer: {
    flex: 1,
  },
  menuCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.large,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.medium,
    borderWidth: 1,
    borderColor: Colors.light.borderLight,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    ...Shadows.small,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  arrowIcon: {
    marginLeft: Spacing.sm,
  },
  footer: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.light.textTertiary,
    marginTop: 2,
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
    color: Colors.light.textInverse,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
