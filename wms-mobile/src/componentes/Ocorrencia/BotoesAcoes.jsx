import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function BotoesAcoes({ onSalvar, onCancelar }) {
  return (
    <View style={styles.botoesFixos}>
      <TouchableOpacity style={styles.btnSalvar} onPress={onSalvar}>
        <Text style={styles.salvarText}>Salvar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnCancelar} onPress={onCancelar}>
        <Text style={styles.cancelarText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  botoesFixos: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 50 },
  btnSalvar: { backgroundColor: '#4CAF50', paddingVertical: 16, flex: 1, marginRight: 8, borderRadius: 6, alignItems: 'center' },
  btnCancelar: { borderColor: '#4CAF50', borderWidth: 2, paddingVertical: 16, flex: 1, marginLeft: 8, borderRadius: 6, alignItems: 'center' },
  salvarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelarText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 16 },
});