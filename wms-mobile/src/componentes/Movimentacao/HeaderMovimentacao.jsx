import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Shadows, BorderRadius, Spacing } from '../../../constants/Colors';

export default function HeaderMovimentacao({
  tipo,
  localizacao_id,
  setTipo,
  setEanLocalizacao,
  setlocalizacao_id,
  setNomeLocalizacao,
  setProdutos,
  tipoBloqueado,
  localizacaoRef
}) {
  const navigation = useNavigation();

  const handleTipoChange = (novoTipo) => {
    if (tipoBloqueado) return;
    setTipo(novoTipo);
    setEanLocalizacao('');
    setlocalizacao_id(null);
    setNomeLocalizacao('');
    setProdutos([]);
    setTimeout(() => {
      localizacaoRef.current?.focus();
    }, 100);
  };

  const handleClose = () => {
    if (localizacao_id) {
      Alert.alert(
        'Movimentação pendente',
        `Movimentação do tipo ${tipo.toUpperCase()} está em andamento.\nFinalize ou cancele antes de sair.`
      );
    } else {
      navigation.navigate('Home');
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerShadow}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={handleClose} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.light.textPrimary} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>Movimentação</Text>
              <Text style={styles.headerSubtitle}>Controle de entrada e saída</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={[
              styles.statusBadge,
              tipo === 'entrada'
                ? styles.statusBadgeEntrada
                : styles.statusBadgeSaida
            ]}>
              <Text style={styles.statusText}>{tipo.toUpperCase()}</Text>
            </View>
          </View>
        </View>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              tipo === 'entrada' && styles.activeToggle,
              tipoBloqueado && styles.disabledToggle
            ]}
            onPress={() => handleTipoChange('entrada')}
            disabled={tipoBloqueado}
          >
            <Ionicons
              name="arrow-down-circle"
              size={20}
              color={tipo === 'entrada' ? Colors.light.textInverse : Colors.light.textSecondary}
              style={styles.toggleIcon}
            />
            <Text style={[
              styles.toggleText,
              tipo === 'entrada' && styles.activeToggleText,
              tipoBloqueado && styles.disabledText
            ]}>
              ENTRADA
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              tipo === 'saida' && styles.activeToggle,
              tipoBloqueado && styles.disabledToggle
            ]}
            onPress={() => handleTipoChange('saida')}
            disabled={tipoBloqueado}
          >
            <Ionicons
              name="arrow-up-circle"
              size={20}
              color={tipo === 'saida' ? Colors.light.textInverse : Colors.light.textSecondary}
              style={styles.toggleIcon}
            />
            <Text style={[
              styles.toggleText,
              tipo === 'saida' && styles.activeToggleText,
              tipoBloqueado && styles.disabledText
            ]}>
              SAÍDA
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: Platform.OS === 'ios' ? 8 : 0,
    paddingHorizontal: Spacing.md,
    zIndex: 10,
  },
  headerShadow: {
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 7,
      },
    }),
    paddingTop: 8,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 56,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    ...Shadows.small,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: Colors.light.textPrimary,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.light.surfaceVariant,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
    ...Shadows.small,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md - 2,
    borderRadius: BorderRadius.md,
    marginHorizontal: 2,
    transitionDuration: '150ms',
  },
  activeToggle: {
    backgroundColor: Colors.light.primary,
    ...Shadows.small,
  },
  disabledToggle: {
    opacity: 0.4,
  },
  toggleIcon: {
    marginRight: Spacing.xs,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.light.textSecondary,
    letterSpacing: 0.5,
  },
  activeToggleText: {
    color: Colors.light.textInverse,
  },
  disabledText: {
    opacity: 0.6,
  },
  statusBadge: {
    minWidth: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  statusBadgeEntrada: {
    backgroundColor: Colors.light.success,
  },
  statusBadgeSaida: {
    backgroundColor: Colors.light.danger || '#E53935',
  },
  statusText: {
    fontSize: 11,     // Menor ainda
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});

