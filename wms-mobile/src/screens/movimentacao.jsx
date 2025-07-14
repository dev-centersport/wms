import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

function Movimentacao() {
  return (
    <View style={[styles.container, {marginTop: 30}]}>
      <Text style={styles.title}>Ocorrência</Text>

      <TextInput style={styles.input} placeholder="Bipe a Localização" />
      <TextInput style={styles.input} placeholder="SKU" />
      <TextInput style={styles.input} placeholder="Quantidade" keyboardType="numeric" />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.buttonPrimary}>
          <Text style={styles.buttonTextPrimary}>Salvar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonSecondary}>
          <Text style={styles.buttonTextSecondary}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fff' 
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 8,
    padding: 12, 
    marginBottom: 15, 
    fontSize: 16
  },
  buttonRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginTop: 20
  },
  buttonPrimary: { 
    backgroundColor: '#4CAF50', 
    padding: 15, 
    borderRadius: 8, 
    flex: 1, 
    marginRight: 10 
  },
  buttonSecondary: { 
    padding: 15, 
    borderRadius: 8, 
    flex: 1, 
    borderWidth: 1, 
    borderColor: '#4CAF50' 
  },
  buttonTextPrimary: { 
    color: '#fff', 
    textAlign: 'center', 
    fontSize: 16 
  },
  buttonTextSecondary: { 
    color: '#4CAF50', 
    textAlign: 'center', 
    fontSize: 16 
  }
});

export default Movimentacao;
