// componentes/Consulta/SearchBarConsulta.js
import React, { forwardRef } from 'react';
import { View, TextInput, StyleSheet, Keyboard, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchBarConsulta = forwardRef(({ value, onChange, onSubmit, onClear }, ref) => {
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
        autoFocus={true}
      />
      {value.length > 0 && (
        <TouchableOpacity 
          onPress={onClear} 
          style={styles.clearButton}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle" size={22} color="#999" />
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
    paddingRight: 8,
  },
  icon: {
    marginRight: 8,
  },
  clearButton: {
    padding: 6,
    marginLeft: 4,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
});
