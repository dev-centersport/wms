import React from 'react';
import { Text, View, TextInput, StyleSheet } from 'react-native';

export default function QuantidadeDisplay({
  quantidade,
  quantidadeEsperada,
  handleQuantidadeEsperadaChange,
}) {
  if (quantidade === '') return null;

  return (
    <>
      <Text style={styles.label}>Quantidade no Sistema</Text>
      <View style={styles.readOnlyBox}>
        <Text style={styles.readOnlyText}>{quantidade}</Text>
      </View>

      <Text style={styles.label}>Quantidade na Gaveta</Text>
      <TextInput
        style={styles.input}
        value={quantidadeEsperada}
        onChangeText={handleQuantidadeEsperadaChange}
        placeholder="Digite a quantidade que encontrou na gaveta"
        keyboardType="numeric"
        returnKeyType="done"
        blurOnSubmit={true}
      />
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
  readOnlyBox: {
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    padding: 14,
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
    fontSize: 18,
    color: '#495057',
    fontWeight: '700',
    textAlign: 'center',
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
});
