import React, { useState, useRef, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';

export default function Ocorrencia() {
  const [localizacao, setLocalizacao] = useState('');
  const [sku, setSku] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [nomeLocalizacao, setNomeLocalizacao] = useState('');
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [mostrarCancelar, setMostrarCancelar] = useState(false);
  const navigation = useNavigation();
  const inputRef = useRef(null);
  const localizacaoRef = useRef(null);
  const skuRef = useRef(null);

  const [localizacaoBloqueada, setLocalizacaoBloqueada] = useState(false);
  const [skuBloqueado, setSkuBloqueado] = useState(true);

  useEffect(() => {
    if (!localizacaoBloqueada && localizacaoRef.current) {
      setTimeout(() => {
        localizacaoRef.current.focus();
      }, 300);
    }
  }, [localizacaoBloqueada]);

  useEffect(() => {
    if (localizacaoBloqueada && skuRef.current) {
      setTimeout(() => {
        skuRef.current.focus();
      }, 300);
    }
  }, [localizacaoBloqueada]);


  const handleBuscarLocalizacao = async () => {
    try {
      const res = await buscarLocalizacaoPorEAN(localizacao.trim());
      setNomeLocalizacao(`${res.nome} - ${res.armazem}`);
      setLocalizacaoBloqueada(true);
      setSkuBloqueado(false);

      if (skuRef.current) {
        skuRef.current.focus();
      }

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
      setSkuBloqueado(true);
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
      limparTudo();
    } catch (err) {
      Alert.alert('Erro', err.message || 'Erro ao registrar ocorrência.');
    } finally {
      setMostrarConfirmacao(false);
      setTimeout(() => {
        limparTudo();
      }, 300); // espera o modal desaparecer
    }
  };

  const limparTudo = () => {
    setLocalizacao('');
    setSku('');
    setQuantidade('');
    setNomeLocalizacao('');
    setLocalizacaoBloqueada(false);
    setSkuBloqueado(true);

    // Aguarda atualização do estado e aplica o foco manualmente
    setTimeout(() => {
      if (localizacaoRef.current) {
        localizacaoRef.current.focus();
      }
    }, 500); // tempo suficiente para o modal desaparecer e o input reaparecer
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ocorrência</Text>
          <TouchableOpacity
            onPress={() => {
              if (localizacaoBloqueada) {
                Alert.alert(
                  'Ocorrência pendente',
                  'Existe uma ocorrência pendente, termine o processo e envie, ou cancele.'
                );
              } else {
                navigation.navigate('Home');
              }
            }}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* LOCALIZAÇÃO */}
        <Text style={styles.label}>Localização</Text>
        {!localizacaoBloqueada ? (
          <TextInput
            ref={localizacaoRef}
            style={styles.input}
            value={localizacao}
            onChangeText={setLocalizacao}
            onBlur={handleBuscarLocalizacao}
            placeholder="Bipe a localização"
            keyboardType="numeric"
            importantForAccessibility="yes"
          />
        ) : (
          <View style={styles.readOnlyBox}>
            <Text style={styles.readOnlyText}>{nomeLocalizacao || localizacao}</Text>
          </View>
        )}

        {/* PRODUTO */}
        {localizacaoBloqueada && (
          <>
            <Text style={styles.label}>Produto</Text>
            {!skuBloqueado ? (
              <TextInput
                ref={skuRef}
                style={styles.input}
                value={sku}
                onChangeText={setSku}
                onBlur={handleBuscarQuantidade}
                placeholder="Bipe o SKU ou EAN"
                keyboardType="numeric"
                importantForAccessibility="yes"
              />
            ) : (
              <View style={styles.readOnlyBox}>
                <Text style={styles.readOnlyText}>{sku}</Text>
              </View>
            )}
          </>
        )}

        {/* QUANTIDADE */}
        {quantidade !== '' && (
          <>
            <Text style={styles.label}>Quantidade</Text>
            <View style={styles.readOnlyBox}>
              <Text style={styles.readOnlyText}>{quantidade}</Text>
            </View>
          </>
        )}

        {/* BOTÕES */}
        <View style={styles.botoesFixos}>
          <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar}>
            <Text style={styles.salvarText}>Salvar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnCancelar} onPress={() => setMostrarCancelar(true)}>
            <Text style={styles.cancelarText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL CONFIRMAR */}
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

      {/* MODAL CANCELAR */}
      <Modal transparent visible={mostrarCancelar} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cancelar</Text>
              <TouchableOpacity onPress={() => setMostrarCancelar(false)}>
                <Text style={styles.modalClose}>×</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalContent}>
              <Text style={styles.alertIcon}>⚠️</Text>
              <Text style={styles.modalMessage}>
                Deseja realmente cancelar esta ocorrência?
              </Text>
              <TouchableOpacity
                style={styles.btnConfirmar}
                onPress={() => {
                  setMostrarCancelar(false);
                  setTimeout(() => {
                    limparTudo();
                  }, 300); // espera o modal desaparecer
                }}
              >
                <Text style={styles.confirmarText}>Sim, Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 100, paddingTop: 40, backgroundColor: '#fff', flexGrow: 1 },
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
});