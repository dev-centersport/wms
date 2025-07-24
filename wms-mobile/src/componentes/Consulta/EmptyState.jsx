// componentes/Consulta/EmptyState.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function EmptyState({ texto = 'Nenhum resultado encontrado.' }) {
  return (
    <View style={styles.container}>
      <MaterialIcons name="search-off" size={64} color="#ccc" />
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  texto: {
    fontSize: 14,
    color: '#777',
    marginTop: 16,
  },
});
