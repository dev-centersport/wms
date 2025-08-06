import React from 'react';
import { Text, TextInput, View, StyleSheet } from 'react-native';

export default function InputProduto({ refInput, value, onChangeText, onSubmitEditing, bloqueado }) {
  return (
    <>
      <Text style={styles.label}>Produto</Text>
      {!bloqueado ? (
        <TextInput
          ref={refInput}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          placeholder="Bipe o SKU ou EAN"
          keyboardType="default"
          returnKeyType="done"
          blurOnSubmit={false}
          autoCorrect={false}
          autoCapitalize="characters"
          importantForAccessibility="yes"
        />
      ) : (
        <View style={styles.readOnlyBox}>
          <Text style={styles.readOnlyText}>{value}</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  label: { 
    marginTop: 20, 
    marginBottom: 8, 
    fontWeight: '600', 
    fontSize: 15,
    color: '#495057',
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#dee2e6', 
    borderRadius: 10, 
    padding: 14, 
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#212529',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  readOnlyBox: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  readOnlyText: {
    fontSize: 16,
    color: '#495057',
    fontWeight: '700',
    textAlign: 'center',
  },
});
