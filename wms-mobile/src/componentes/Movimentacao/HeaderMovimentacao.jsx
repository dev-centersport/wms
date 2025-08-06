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
        <TouchableOpacity onPress={handleClose}>
          <Ionicons name="close" size={28} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={[styles.toggleContainer, { marginTop: 20 }]}>
        <TouchableOpacity
          style={[styles.toggleBtn, tipo === 'entrada' && styles.active]}
          onPress={() => handleTipoChange('entrada')}
          disabled={tipoBloqueado}
        >
          <Text style={[styles.toggleText, tipoBloqueado && styles.disabledText]}>
            ENTRADA
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, tipo === 'saida' && styles.active]}
          onPress={() => handleTipoChange('saida')}
          disabled={tipoBloqueado}
        >
          <Text style={[styles.toggleText, tipoBloqueado && styles.disabledText]}>
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
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: '#ccc',
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  active: {
    backgroundColor: '#4CAF50',
  },
  toggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  disabledText: {
    opacity: 0.5,
  },
});