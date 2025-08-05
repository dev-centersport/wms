import React, { memo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';

const BotoesMovimentacao = memo(({ onSalvar, onCancelar, visible, carregando = false }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.botoesFlexiveis}>
        <TouchableOpacity 
          style={[styles.btnSalvar, carregando && styles.btnDisabled]} 
          onPress={onSalvar} 
          activeOpacity={0.8}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.salvarText}>Salvar</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.btnCancelar, carregando && styles.btnDisabled]} 
          onPress={onCancelar} 
          activeOpacity={0.8}
          disabled={carregando}
        >
          <Text style={styles.cancelarText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

BotoesMovimentacao.displayName = 'BotoesMovimentacao';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  botoesFlexiveis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  btnSalvar: {
    flex: 1,
    backgroundColor: '#43A047',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    ...Platform.select({
      ios: {
        shadowColor: '#43A047',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
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
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  salvarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  cancelarText: {
    color: '#43A047',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default BotoesMovimentacao;
