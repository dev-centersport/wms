// componentes/Consulta/SearchBarConsulta.js
import React, { forwardRef } from 'react';
import { View, TextInput, StyleSheet, Keyboard, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchBarConsulta = forwardRef(({ value, onChange, onSubmit, onClear }, ref) => {
  return (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={18} color="#6c757d" style={styles.icon} />
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
        placeholderTextColor="#adb5bd"
        autoFocus={true}
      />
      {value.length > 0 && (
        <TouchableOpacity 
          onPress={onClear} 
          style={styles.clearButton}
          activeOpacity={0.7}
        >
          <Ionicons name="close-circle" size={20} color="#6c757d" />
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#212529',
    paddingRight: 8,
    fontWeight: '400',
  },
  icon: {
    marginRight: 10,
    color: '#6c757d',
  },
  clearButton: {
    padding: 8,
    marginLeft: 6,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
});
