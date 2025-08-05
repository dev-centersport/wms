import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

export default function BotoesAcoes({ onSalvar, onCancelar }) {
  return (
    <View style={styles.botoesFixos}>
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
  botoesFixos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16, // Mais espaçamento entre botões
    marginTop: 36,
    marginHorizontal: 8,
  },
  btnSalvar: {
    flex: 1,
    backgroundColor: '#43A047', // Tom de verde mais sóbrio
    paddingVertical: 12,
    borderRadius: 999, // Borda bem arredondada
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
