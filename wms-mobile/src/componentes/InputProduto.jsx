import React from 'react';
import { Text, TextInput, View, StyleSheet } from 'react-native';

export default function InputProduto({ refInput, value, onChange, onBlur, bloqueado }) {
  return (
    <>
      <Text style={styles.label}>Produto</Text>
      {!bloqueado ? (
        <TextInput
          ref={refInput}
          style={styles.input}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          placeholder="Bipe o SKU ou EAN"
          keyboardType="numeric"
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
  label: { marginTop: 20, marginBottom: 6, fontWeight: '600', fontSize: 14 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, fontSize: 16 },
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
});