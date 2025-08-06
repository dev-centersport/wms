import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function HeaderMovimentacao({ tipo, localizacao_id, setTipo, setEanLocalizacao, setlocalizacao_id, setNomeLocalizacao, setProdutos, tipoBloqueado, localizacaoRef }) {
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Movimentação - {tipo.toUpperCase()}</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#495057" />
        </TouchableOpacity>
      </View>

      <View style={[styles.toggleContainer, { marginTop: 20 }]}>
        <TouchableOpacity
          style={[styles.toggleBtn, tipo === 'entrada' && styles.active]}
          onPress={() => handleTipoChange('entrada')}
          disabled={tipoBloqueado}
        >
          <Text style={[
            styles.toggleText, 
            tipo === 'entrada' && styles.activeText,
            tipoBloqueado && styles.disabledText
          ]}>
            ENTRADA
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, tipo === 'saida' && styles.active]}
          onPress={() => handleTipoChange('saida')}
          disabled={tipoBloqueado}
        >
          <Text style={[
            styles.toggleText, 
            tipo === 'saida' && styles.activeText,
            tipoBloqueado && styles.disabledText
          ]}>
            SAÍDA
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 65,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212529',
    letterSpacing: 0.3,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 14,
    marginHorizontal: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  active: {
    backgroundColor: '#28a745',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    color: '#6c757d',
    fontWeight: '600',
    fontSize: 15,
  },
  activeText: {
    color: '#ffffff',
  },
  disabledText: {
    opacity: 0.5,
  },
});