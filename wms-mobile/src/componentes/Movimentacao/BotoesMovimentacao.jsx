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
    marginTop: 30,
    paddingHorizontal: 4,
  },
  btnSalvar: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    flex: 1,
    marginRight: 8,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  btnCancelar: {
    borderColor: '#dc3545',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    paddingVertical: 16,
    flex: 1,
    marginLeft: 8,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  salvarText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  cancelarText: {
    color: '#dc3545',
    fontWeight: '600',
    fontSize: 16,
  },
});
