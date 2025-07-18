import React from 'react';
import { Text, TextInput, StyleSheet, View } from 'react-native';

export default function InputLocalizacao({ refInput, value, onChangeText, onSubmitEditing, bloqueado, nomeLocalizacao }) {
  return (
    <>
      <Text style={styles.label}>Localização</Text>
      {!bloqueado ? (
        <TextInput
          ref={refInput}
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          placeholder="Bipe a localização"
          keyboardType="default"
          returnKeyType="done"
          blurOnSubmit={false}
          autoCorrect={false}
          autoCapitalize="characters"
          importantForAccessibility="yes"
        />
      ) : (
        <View style={styles.readOnlyBox}>
          <Text style={styles.readOnlyText}>{nomeLocalizacao || value}</Text>
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
