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
  label: { marginTop: 20, marginBottom: 6, fontWeight: '600', fontSize: 14 },
  readOnlyBox: {
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  readOnlyText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
  },
});
