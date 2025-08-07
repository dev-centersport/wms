// componentes/Consulta/SearchBarConsulta.js
import React, { forwardRef } from 'react';
import { View, TextInput, StyleSheet, Keyboard, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchBarConsulta = forwardRef(({ value, onChange, onSubmit }, ref) => {
  return (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={18} color="#444" style={styles.icon} />
      <TextInput
        ref={ref}
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
      {value.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => onChange('')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close-circle" size={18} color="#888" />
        </TouchableOpacity>
      )}
    </View>
  );
});

SearchBarConsulta.displayName = 'SearchBarConsulta';

export default SearchBarConsulta;

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
  clearButton: {
    marginLeft: 8,
    padding: 2,
  },
});
