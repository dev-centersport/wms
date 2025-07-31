// componentes/Consulta/SearchBarConsulta.js
import React from 'react';
import { View, TextInput, StyleSheet, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchBarConsulta({ value, onChange, onSubmit }) {
  return (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={18} color="#444" style={styles.icon} />
      <TextInput
        placeholder="Buscar por Nome, SKU ou EAN"
        style={styles.searchInput}
        value={value}
        onChangeText={onChange}
        onSubmitEditing={() => {
          Keyboard.dismiss();
          onSubmit();
        }}
        returnKeyType="search"
        placeholderTextColor="#888"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  icon: {
    marginRight: 8,
  },
});
