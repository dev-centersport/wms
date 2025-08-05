import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Colors, Shadows, BorderRadius, Spacing } from '../../../constants/Colors';

export default function HeaderMovimentacao({ onClose, localizacao_id, eanLocalizacaoAberta, onCancelarMovimentacao }) {
  const navigation = useNavigation();

  const handleClose = () => {
    // Travar saída se localização estiver bipada
    if (localizacao_id) {
      Alert.alert(
        'Movimentação em Andamento',
        'Você tem uma movimentação em andamento. Finalize ou cancele a operação antes de sair.',
        [
          { 
            text: 'Continuar Movimentação', 
            style: 'cancel', 
            onPress: () => { } 
          },
          {
            text: 'Cancelar e Sair',
            style: 'destructive',
            onPress: async () => {
              if (onCancelarMovimentacao) {
                await onCancelarMovimentacao();
              }
              if (onClose) {
                onClose();
              } else {
                navigation.navigate('Home');
              }
            },
          },
        ]
      );
    } else {
      if (onClose) {
        onClose();
      } else {
        navigation.navigate('Home');
      }
    }
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.textPrimary} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Movimentação de Estoque</Text>
            <Text style={styles.headerSubtitle}>Transferência entre localizações</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.moveBadge}>
            <Ionicons name="swap-horizontal" size={16} color={Colors.light.textInverse} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 40,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.textPrimary,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  moveBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.success,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
});

