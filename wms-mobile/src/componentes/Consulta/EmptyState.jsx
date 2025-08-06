// componentes/Consulta/EmptyState.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function EmptyState({ texto = 'Nenhum resultado encontrado.' }) {
  return (
    <View style={styles.container}>
      <MaterialIcons name="search-off" size={72} color="#adb5bd" />
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  texto: {
    fontSize: 16,
    color: '#6c757d',
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
});
