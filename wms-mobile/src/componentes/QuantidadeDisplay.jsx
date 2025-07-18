import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function QuantidadeDisplay({ quantidade }) {
  if (quantidade === '') return null;
  return (
    <>
      <Text style={styles.label}>Quantidade</Text>
      <View style={styles.readOnlyBox}>
        <Text style={styles.readOnlyText}>{quantidade}</Text>
      </View>
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
});