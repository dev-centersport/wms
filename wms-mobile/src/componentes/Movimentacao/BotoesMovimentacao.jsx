import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';

export default function BotoesMovimentacao({ onSalvar, onCancelar, visible }) {
  if (!visible) return null;

  return (
    <View style={styles.botoesFlexiveis}>
      <TouchableOpacity style={styles.btnSalvar} onPress={onSalvar} activeOpacity={0.85}>
        <Text style={styles.salvarText}>Salvar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.btnCancelar} onPress={onCancelar} activeOpacity={0.85}>
        <Text style={styles.cancelarText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  botoesFlexiveis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16, // Mais espaço entre botões
    marginTop: 24,
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  btnSalvar: {
    flex: 1,
    backgroundColor: '#43A047',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#43A047',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.18,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  btnCancelar: {
    flex: 1,
    backgroundColor: '#fff',
    borderColor: '#43A047',
    borderWidth: 2,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  salvarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  cancelarText: {
    color: '#43A047',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
