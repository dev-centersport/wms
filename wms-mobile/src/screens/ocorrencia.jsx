// Ocorrencia.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Ocorrencia() {
  const [localizacao, setLocalizacao] = useState('');
  const [sku, setSku] = useState('');
  const [quantidade, setQuantidade] = useState('1');

  const inputRef = useRef(null);

  const handleSalvar = () => {
    // lógica para salvar ocorrência
    alert(`Ocorrência salva com ${quantidade} unidade(s)!`);
  };

  const handleCancelar = () => {
    setLocalizacao('');
    setSku('');
    setQuantidade('1');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ocorrência</Text>
          <TouchableOpacity>
            <Text style={styles.headerFechar}>Fechar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Bipe a Localização</Text>
        <TextInput
          style={styles.input}
          value={localizacao}
          onChangeText={setLocalizacao}
          placeholder="Localização"
          keyboardType="numeric"
        />

        <Text style={styles.label}>SKU</Text>
        <View style={styles.skuContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={sku}
            onChangeText={setSku}
            placeholder="SKU"
            keyboardType="numeric"
            ref={inputRef}
          />
          <TouchableOpacity onPress={() => inputRef.current?.focus()}>
            <Ionicons name="search" size={24} color="#4CAF50" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Quantidade</Text>
        <TextInput
          style={styles.input}
          value={quantidade}
          onChangeText={setQuantidade}
          placeholder="Quantidade"
          keyboardType="numeric"
        />

        <View style={styles.botoesFixos}>
          <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar}>
            <Text style={styles.salvarText}>Salvar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCancelar} onPress={handleCancelar}>
            <Text style={styles.cancelarText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  headerFechar: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 14,
  },
  label: {
    marginTop: 20,
    marginBottom: 6,
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
  },
  skuContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botoesFixos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 50,
  },
  btnSalvar: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    flex: 1,
    marginRight: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnCancelar: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    paddingVertical: 16,
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
