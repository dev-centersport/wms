import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  buscarLocalizacaoPorEAN,
  buscarProdutoPorEAN,
  enviarMovimentacao,
  buscarProdutosPorLocalizacaoDireto,
} from '../api/index';

export default function Movimentacao() {
  const [tipo, setTipo] = useState('entrada');
  const [tipoBloqueado, setTipoBloqueado] = useState(false);
  const [eanLocalizacao, setEanLocalizacao] = useState('');
  const [localizacao_id, setlocalizacao_id] = useState(null);
  const [nomeLocalizacao, setNomeLocalizacao] = useState('');
  const [eanProduto, setEanProduto] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [mostrarCancelar, setMostrarCancelar] = useState(false);
  const [produtosNaLocalizacao, setProdutosNaLocalizacao] = useState([]);

  const localizacaoRef = useRef(null);
  const produtoRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!tipoBloqueado && localizacaoRef.current) {
      localizacaoRef.current.focus();
    }
  }, [tipo, tipoBloqueado]);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [produtos]);

  const handleTipoChange = (novoTipo) => {
    if (tipoBloqueado) return;
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
      setTipoBloqueado(true);
      setEanLocalizacao('');

      // 🔽 Aqui você busca os produtos que estão na localização:
      const produtosExistentes = await buscarProdutosPorLocalizacaoDireto(loc.localizacao_id);
      setProdutosNaLocalizacao(produtosExistentes);
      ;

      setTimeout(() => {
        produtoRef.current?.focus();
      }, 100);
    } catch {
      Alert.alert('Erro ao buscar localização');
    }
  };

  const handleAdicionarProduto = async () => {
    if (!localizacao_id) {
      Alert.alert('Bipe uma localização antes de bipar produtos.');
      return;
    }
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
        estoque_localizacao: produto.estoque || 0,
      };

      // 🔍 Aqui está o log completo do produto bipado
      console.log('🔍 Produto bipado:', JSON.stringify(produtoFormatado, null, 2));

      setProdutos((prev) => [...prev, produtoFormatado]);
      setEanProduto('');
      setTimeout(() => {
        produtoRef.current?.focus();
      }, 100);
    } catch {
      Alert.alert('Produto não encontrado');
    }
  };

  const verificarEstoqueAntesDeConfirmar = () => {
    if (tipo === 'saida') {
      const erros = [];

      console.log('🔁 Verificando estoque para saída', produtosNaLocalizacao);

      produtos.forEach((produto) => {
        console.log('🧪 Produto bipado:', produto.produto_id);
        console.log('📦 Produtos na localização:', produtosNaLocalizacao.map(p => p.produto_id));

        const existente = produtosNaLocalizacao.find(
          (p) => Number(p.produto_id) === Number(produto.produto_id)
        );

        const qtd = produto.quantidade ?? 1;
        const estoque = existente?.quantidade ?? 0;

        if (!existente) {
          console.log('❌ Produto não está na localização');
          erros.push(`Produto "${produto.descricao}" não está presente na localização.`);
        } else if (qtd > estoque) {
          console.log('⚠️ Quantidade excede o estoque');
          erros.push(`Produto "${produto.descricao}" com quantidade ${qtd} excede o estoque (${estoque}).`);
        }
      });

      if (erros.length > 0) {
        setTimeout(() => {
          Alert.alert('Erro na Saída', erros.join('\n'));
        }, 100); // pequeno atraso garante que o modal renderize corretamente
        return;
      }

    }

    setMostrarConfirmacao(true);
  };


  const handleConfirmar = async () => {
    setMostrarConfirmacao(false);
    try {
      console.log('🔁 Verificando estoque para saída', produtos, produtosNaLocalizacao);

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
      limparTudo();
    } catch {
      Alert.alert('Erro ao salvar movimentação');
    }
  };

  const limparTudo = () => {
    setProdutos([]);
    setlocalizacao_id(null);
    setNomeLocalizacao('');
    setEanLocalizacao('');
    setEanProduto('');
    setTipoBloqueado(false);
    setTimeout(() => {
      localizacaoRef.current?.focus();
    }, 100);
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
                style={[styles.toggleBtn, tipo === 'entrada' && styles.active, { marginTop: 20 }]}
                onPress={() => handleTipoChange('entrada')}
                disabled={tipoBloqueado}
              >
                <Text style={[styles.toggleText, tipoBloqueado && styles.disabledText]}>ENTRADA</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, tipo === 'saida' && styles.active, { marginTop: 20 }]}
                onPress={() => handleTipoChange('saida')}
                disabled={tipoBloqueado}
              >
                <Text style={[styles.toggleText, tipoBloqueado && styles.disabledText]}>SAÍDA</Text>
              </TouchableOpacity>
            </View>
            {!localizacao_id && (
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
            {localizacao_id && (
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
              ref={flatListRef}
              data={produtos}
              keyExtractor={(_, index) => index.toString()}
              style={{ marginTop: 4, marginBottom: 60 }}
              renderItem={({ item, index }) => (
                <View style={styles.produtoItem}>
                  <Text style={styles.contador}>{index + 1}</Text>
                  {item.url_foto && (
                    <Image
                      source={{ uri: item.url_foto }}
                      style={styles.foto}
                      resizeMode="cover" // ou 'contain', 'stretch', 'center'
                    />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.produtoNome}>{item.descricao}</Text>
                    <Text style={styles.produtoSKU}>SKU: {item.sku}</Text>
                  </View>
                </View>
              )}
            />
            <View style={styles.botoesFixos}>
              <TouchableOpacity style={styles.btnSalvar} onPress={verificarEstoqueAntesDeConfirmar}>
                <Text style={styles.salvarText}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnCancelar} onPress={() => setMostrarCancelar(true)}>
                <Text style={styles.cancelarText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Modal Confirmar */}
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
                  Confirma a {tipo === 'entrada' ? 'Entrada' : 'Saída'} de {produtos.length} SKU?
                </Text>
                <TouchableOpacity style={styles.btnConfirmar} onPress={handleConfirmar}>
                  <Text style={styles.confirmarText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
                <Text style={styles.modalMessage}>Deseja realmente cancelar a {tipo}?</Text>
                <TouchableOpacity
                  style={styles.btnConfirmar}
                  onPress={() => {
                    setMostrarCancelar(false);
                    limparTudo();
                  }}
                >
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
  disabledText: { opacity: 0.5 },
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
    backgroundColor: '#eee',
    padding: 6,
    borderRadius: 4,
    marginBottom: 6,
  },
  produtoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  contador: {
    fontWeight: 'bold',
    width: 20,
    marginRight: 6,
    textAlign: 'center',
  },
  foto: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  produtoNome: { fontSize: 16, fontWeight: '600', color: '#333' },
  produtoSKU: { fontSize: 12, color: '#888' },
  totalSKU: {
    textAlign: 'right',
    marginTop: 10,
    fontWeight: 'bold',
    color: '#555',
  },
  botoesFixos: {
    position: 'absolute',
    bottom: 10,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 8,
    overflow: 'hidden',
    borderColor: '#4CAF50',
    borderWidth: 1,
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