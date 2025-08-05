// componentes/BotoesMovimentacao.jsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function BotoesMovimentacao({ onSalvar, onCancelar, visible }) {
  if (!visible) return null;

  return (
    <View style={styles.botoesFlexiveis}>
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
  botoesFlexiveis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  btnSalvar: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    flex: 1,
    marginRight: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnCancelar: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    paddingVertical: 14,
    flex: 1,
    marginLeft: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  salvarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelarText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
