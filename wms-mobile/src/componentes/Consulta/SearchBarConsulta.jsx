// componentes/Consulta/SearchBarConsulta.js
import React from 'react';
import { View, TextInput, StyleSheet, Keyboard, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius, Spacing } from '../../../constants/Colors';

export default function SearchBarConsulta({ value, onChange, onSubmit }) {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color={Colors.light.textTertiary} style={styles.icon} />
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
          placeholderTextColor={Colors.light.placeholder}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChange('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={18} color={Colors.light.textTertiary} />
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity 
        style={styles.searchButton} 
        onPress={() => {
          Keyboard.dismiss();
          onSubmit();
        }}
        disabled={value.trim().length < 2}
      >
        <Ionicons 
          name="arrow-forward" 
          size={20} 
          color={value.trim().length >= 2 ? Colors.light.textInverse : Colors.light.textTertiary} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.inputBackground,
    borderRadius: BorderRadius.medium,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.inputBorder,
    ...Shadows.small,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.textPrimary,
    paddingVertical: Spacing.xs,
    fontWeight: '500',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.medium,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
});
