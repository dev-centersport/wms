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
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  buscarLocalizacaoPorEAN,
  buscarProdutoEstoquePorLocalizacaoEAN,
  criarOcorrencia,
} from '../api/index';

export default function Ocorrencia() {
  const [localizacao, setLocalizacao] = useState('');
  const [sku, setSku] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [nomeLocalizacao, setNomeLocalizacao] = useState('');
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const inputRef = useRef(null);

  const handleBuscarLocalizacao = async () => {
    try {
      const res = await buscarLocalizacaoPorEAN(localizacao.trim());
      setNomeLocalizacao(`${res.nome} - ${res.armazem}`);
    } catch (err) {
      setNomeLocalizacao('');
      Alert.alert('Erro', 'Localização não encontrada.');
    }
  };

  const handleBuscarQuantidade = async () => {
    try {
      if (!localizacao.trim() || !sku.trim()) return;

      const dados = await buscarProdutoEstoquePorLocalizacaoEAN(localizacao.trim(), sku.trim());
      setQuantidade(String(dados.quantidade));
    } catch (err) {
      setQuantidade('');
      Alert.alert('Erro', err.message || 'Produto não encontrado nesta localização.');
    }
  };

  const handleSalvar = () => {
    if (!localizacao || !sku) {
      Alert.alert('Atenção', 'Preencha a localização e o SKU/EAN.');
      return;
    }
    setMostrarConfirmacao(true);
  };

  const confirmarSalvar = async () => {
    try {
      const dados = await buscarProdutoEstoquePorLocalizacaoEAN(localizacao.trim(), sku.trim());

      const payload = {
        usuario_id: 1,
        localizacao_id: dados.localizacao_id,
        produto_estoque_id: dados.produto_estoque_id,
      };

      await criarOcorrencia(payload);
      Alert.alert('Sucesso', 'Ocorrência registrada com sucesso!');
      handleCancelar();
    } catch (err) {
      Alert.alert('Erro', err.message || 'Erro ao registrar ocorrência.');
    } finally {
      setMostrarConfirmacao(false);
    }
  };

  const handleCancelar = () => {
    setLocalizacao('');
    setSku('');
    setQuantidade('');
    setNomeLocalizacao('');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ocorrência</Text>
          <TouchableOpacity onPress={handleCancelar}>
            <Text style={styles.headerFechar}>Fechar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Bipe a Localização</Text>
        <TextInput
          style={styles.input}
          value={localizacao}
          onChangeText={(text) => {
            setLocalizacao(text);
            setNomeLocalizacao('');
            setQuantidade('');
          }}
          onBlur={handleBuscarLocalizacao}
          placeholder="EAN da Localização"
          keyboardType="numeric"
        />

        {nomeLocalizacao !== '' && (
          <Text style={styles.localizacaoInfo}>{nomeLocalizacao}</Text>
        )}

        <Text style={styles.label}>SKU / EAN</Text>
        <View style={styles.skuContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={sku}
            onChangeText={(text) => {
              setSku(text);
              setQuantidade('');
            }}
            onBlur={handleBuscarQuantidade}
            placeholder="SKU ou EAN"
            keyboardType="numeric"
            ref={inputRef}
          />
          <TouchableOpacity onPress={() => inputRef.current?.focus()}>
            <Ionicons name="search" size={24} color="#4CAF50" style={{ marginLeft: 10 }} />
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Quantidade na Localização</Text>
        <TextInput
          style={styles.input}
          value={quantidade}
          editable={false}
          placeholder="Quantidade"
        />

        <View style={styles.botoesFixos}>
          <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar}>
            <Text style={styles.salvarText}>Salvar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCancelar} onPress={handleCancelar}>
            <Text style={styles.cancelarText}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        {/* Modal de confirmação */}
        <Modal transparent visible={mostrarConfirmacao} animationType="fade">
          <View style={styles.overlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Confirmação</Text>
                <TouchableOpacity onPress={() => setMostrarConfirmacao(false)}>
                  <Text style={styles.modalClose}>×</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalContent}>
                <Text style={styles.alertIcon}>❗</Text>
                <Text style={styles.modalMessage}>
                  Confirma registrar a ocorrência com {quantidade || '0'} unidade(s)?
                </Text>
                <TouchableOpacity style={styles.btnConfirmar} onPress={confirmarSalvar}>
                  <Text style={styles.confirmarText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 100, backgroundColor: '#fff', flexGrow: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontWeight: 'bold', fontSize: 18 },
  headerFechar: { fontWeight: 'bold', color: '#000', fontSize: 14 },
  label: { marginTop: 20, marginBottom: 6, fontWeight: '600', fontSize: 14 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, fontSize: 16 },
  skuContainer: { flexDirection: 'row', alignItems: 'center' },
  botoesFixos: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 50 },
  btnSalvar: { backgroundColor: '#4CAF50', paddingVertical: 16, flex: 1, marginRight: 8, borderRadius: 6, alignItems: 'center' },
  btnCancelar: { borderColor: '#4CAF50', borderWidth: 2, paddingVertical: 16, flex: 1, marginLeft: 8, borderRadius: 6, alignItems: 'center' },
  salvarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelarText: { color: '#4CAF50', fontWeight: 'bold', fontSize: 16 },
  localizacaoInfo: { fontWeight: 'bold', color: '#4CAF50', backgroundColor: '#eee', padding: 6, borderRadius: 4, marginBottom: 6 },
  overlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#fff', width: '80%', borderRadius: 8, overflow: 'hidden', borderColor: '#4CAF50', borderWidth: 1 },
  modalHeader: { backgroundColor: '#4CAF50', padding: 10, flexDirection: 'row', justifyContent: 'space-between' },
  modalTitle: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  modalClose: { color: '#fff', fontSize: 18 },
  modalContent: { alignItems: 'center', padding: 20 },
  alertIcon: { fontSize: 40, marginBottom: 10 },
  modalMessage: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  btnConfirmar: { backgroundColor: '#4CAF50', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 8 },
  confirmarText: { color: '#fff', fontSize: 16 },
});
