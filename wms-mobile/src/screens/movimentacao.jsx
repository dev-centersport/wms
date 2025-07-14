import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Image,
} from 'react-native';
import {
  buscarLocalizacaoPorEAN,
  buscarProdutoPorEAN,
  enviarMovimentacao,
} from '../api/index';

export default function Movimentacao() {
  const [tipo, setTipo] = useState('entrada');
  const [eanLocalizacao, setEanLocalizacao] = useState('');
  const [localizacao_id, setlocalizacao_id] = useState(null);
  const [nomeLocalizacao, setNomeLocalizacao] = useState('');
  const [eanProduto, setEanProduto] = useState('');
  const [produtos, setProdutos] = useState([]);
  const localizacaoRef = useRef(null);
  const produtoRef = useRef(null);

  useEffect(() => {
    if (!tipoBloqueado && localizacaoRef.current) {
      localizacaoRef.current.focus();
    }
  }, [tipo, tipoBloqueado]);

  const handleTipoChange = (novoTipo) => {
    setTipo(novoTipo);
    setEanLocalizacao('');
    setlocalizacao_id(null);
    setNomeLocalizacao('');
    setProdutos([]);
    setTimeout(() => {
      localizacaoRef.current?.focus();
    }, 100);
  };

  const handleBuscarLocalizacao = async () => {
    try {
      const loc = await buscarLocalizacaoPorEAN(eanLocalizacao.trim());
      if (!loc || !loc.localizacao_id) {
        Alert.alert('Localização não encontrada');
        return;
      }
      setlocalizacao_id(loc.localizacao_id);
      setNomeLocalizacao(`${loc.nome} - ${loc.armazem}`);
      setEanLocalizacao('');
      setTimeout(() => {
        produtoRef.current?.focus();
      }, 100);
    } catch {
      Alert.alert('Erro ao buscar localização');
    }
  };

  const handleAdicionarProduto = async () => {
    try {
      const produto = await buscarProdutoPorEAN(eanProduto.trim());
      if (!produto || !produto.produto_id) {
        Alert.alert('Produto inválido');
        return;
      }
      const produtoFormatado = {
        produto_id: produto.produto_id,
        descricao: produto.descricao,
        ean: produto.ean,
        sku: produto.sku,
        url_foto: produto.url_foto,
        quantidade: 1,
      };
      setProdutos((prev) => [...prev, produtoFormatado]);
      setEanProduto('');
      setTimeout(() => {
        produtoRef.current?.focus();
      }, 100);
    } catch {
      Alert.alert('Produto não encontrado');
    }
  };

  const handleConfirmar = async () => {
    setMostrarConfirmacao(false);
    try {
      const payload = {
        tipo,
        usuario_id: 1,
        localizacao_origem_id: tipo === 'saida' ? localizacao_id : 0,
        localizacao_destino_id: tipo === 'entrada' ? localizacao_id : 0,
        itens_movimentacao: produtos.map((p) => ({
          produto_id: Number(p.produto_id),
          quantidade: Number(p.quantidade),
        })),
      };
      await enviarMovimentacao(payload);
      Alert.alert('Movimentação salva com sucesso');
      setProdutos([]);
      setlocalizacao_id(null);
      setEanLocalizacao('');
      setNomeLocalizacao('');
      setEanProduto('');
      setTimeout(() => {
        localizacaoRef.current?.focus();
      }, 100);
    } catch {
      Alert.alert('Erro ao salvar movimentação');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {produtos.length === 0 && (
          <>
            <Text style={[styles.title]}>Movimentação - {tipo.toUpperCase()}</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleBtn, tipo === 'entrada' && styles.active, {marginTop:20}]}
                onPress={() => handleTipoChange('entrada')}
                disabled={tipoBloqueado}
              >
                <Text style={[styles.toggleText, tipoBloqueado && styles.disabledText]}>
                  ENTRADA
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, tipo === 'saida' && styles.active, {marginTop:20}]}
                onPress={() => handleTipoChange('saida')}
                disabled={tipoBloqueado}
              >
                <Text style={[styles.toggleText, tipoBloqueado && styles.disabledText]}>
                  SAÍDA
                </Text>
              </TouchableOpacity>
            </View>
            {!localizacaoId && (
              <TextInput
                ref={localizacaoRef}
                value={eanLocalizacao}
                onChangeText={setEanLocalizacao}
                onSubmitEditing={handleBuscarLocalizacao}
                placeholder="Bipe a Localização"
                style={styles.input}
                keyboardType="numeric"
                showSoftInputOnFocus={false}
              />
            )}
            {nomeLocalizacao !== '' && (
              <Text style={styles.localizacaoInfo}>{nomeLocalizacao}</Text>
            )}
            {localizacaoId && (
              <TextInput
                ref={produtoRef}
                value={eanProduto}
                onChangeText={setEanProduto}
                onSubmitEditing={handleAdicionarProduto}
                placeholder="Bipe o Produto"
                style={styles.input}
                keyboardType="numeric"
                showSoftInputOnFocus={false}
              />
            )}
          </>
        )}

        {produtos.length > 0 && (
          <>
            <Text style={styles.localizacaoInfo}>{nomeLocalizacao}</Text>
            <TextInput
              ref={produtoRef}
              value={eanProduto}
              onChangeText={setEanProduto}
              onSubmitEditing={handleAdicionarProduto}
              placeholder="Bipe o Produto"
              style={styles.input}
              keyboardType="numeric"
              showSoftInputOnFocus={false}
            />
            <Text style={styles.totalSKU}>Total: {produtos.length} SKU</Text>
            <FlatList
              data={produtos}
              keyExtractor={(_, index) => index.toString()}
              style={{ marginTop: 4, marginBottom: 60 }}
              renderItem={({ item, index }) => (
                <View style={styles.produtoItem}>
                  <Text style={styles.contador}>{index + 1}</Text>
                  <Image
                    source={
                      item.url_foto
                        ? { uri: item.url_foto }
                        : require('../../assets/images/no-image.png')
                    }
                    style={styles.foto}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.produtoNome}>{item.descricao}</Text>
                    <Text style={styles.produtoSKU}>SKU: {item.sku}</Text>
                  </View>
                </View>
              )}
            />
            <View style={styles.botoesFixos}>
              <TouchableOpacity style={styles.btnSalvar} onPress={() => setMostrarConfirmacao(true)}>
                <Text style={styles.salvarText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnCancelar} onPress={() => setMostrarCancelar(true)}>
                <Text style={styles.cancelarText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

      <TextInput
        ref={localizacaoRef}
        value={eanLocalizacao}
        onChangeText={setEanLocalizacao}
        onSubmitEditing={handleBuscarLocalizacao}
        placeholder="EAN da Localização"
        style={styles.input}
        keyboardType="numeric"
        showSoftInputOnFocus={false}
      />
      {nomeLocalizacao !== '' && (
        <Text style={styles.localizacaoInfo}>{nomeLocalizacao}</Text>
      )}

      <TextInput
        ref={produtoRef}
        value={eanProduto}
        onChangeText={setEanProduto}
        onSubmitEditing={handleAdicionarProduto}
        placeholder="EAN do Produto"
        style={styles.input}
        keyboardType="numeric"
        showSoftInputOnFocus={false}
      />

      <FlatList
        data={produtos}
        keyExtractor={(_, index) => index.toString()}
        style={{ marginTop: 10 }}
        renderItem={({ item }) => (
          <View style={styles.produtoItem}>
            <Image
              source={
                item.url_foto
                  ? { uri: item.url_foto }
                  : require('../../assets/images/no-image.png')
                // Imagem padrão se nula
              }
              style={styles.foto}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.produtoNome}>{item.descricao}</Text>
              <Text style={styles.produtoSKU}>SKU: {item.sku}</Text>
            </View>
          </View>
        )}
      />

        {/* Modal Cancelar */}
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
                  Deseja realmente cancelar a {tipo}?
                </Text>
                <TouchableOpacity style={styles.btnConfirmar} onPress={() => {
                  setMostrarCancelar(false);
                  limparTudo();
                }}>
                  <Text style={styles.confirmarText}>Sim, Cancelar</Text>
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
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  toggleContainer: { flexDirection: 'row', marginBottom: 10 },
  toggleBtn: {
    flex: 1,
    backgroundColor: '#ccc',
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
  },
  active: { backgroundColor: '#4CAF50' },
  toggleText: { color: '#fff', fontWeight: 'bold' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginVertical: 6,
  },
  localizacaoInfo: {
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 6,
    marginTop: -2,
  },
  produtoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  foto: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  produtoSKU: {
    fontSize: 12,
    color: '#888',
  },
  btnSalvar: {
    backgroundColor: '#4CAF50',
    padding: 16,
    alignItems: 'center',
    borderRadius: 8,
    marginTop: 20,
  },
  modalHeader: {
    backgroundColor: '#4CAF50',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalTitle: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  modalClose: { color: '#fff', fontSize: 18 },
  modalContent: { alignItems: 'center', padding: 20 },
  alertIcon: { fontSize: 40, marginBottom: 10 },
  modalMessage: { fontSize: 16, textAlign: 'center', marginBottom: 20 },
  btnConfirmar: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  confirmarText: { color: '#fff', fontSize: 16 },
});
