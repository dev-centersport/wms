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
  const [localizacaoId, setLocalizacaoId] = useState(null);
  const [nomeLocalizacao, setNomeLocalizacao] = useState('');
  const [eanProduto, setEanProduto] = useState('');
  const [produtos, setProdutos] = useState([]);
  const localizacaoRef = useRef(null);
  const produtoRef = useRef(null);

  const handleTipoChange = (novoTipo) => {
    setTipo(novoTipo);
    setEanLocalizacao('');
    setLocalizacaoId(null);
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
      setLocalizacaoId(loc.localizacao_id);
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

  const handleSalvar = async () => {
    if (!localizacaoId || produtos.length === 0) {
      Alert.alert('Preencha localização e produtos');
      return;
    }
    try {
      const payload = {
        tipo,
        usuario_id: 1,
        localizacao_origem_id: tipo === 'saida' ? localizacaoId : 0,
        localizacao_destino_id: tipo === 'entrada' ? localizacaoId : 0,
        itens_movimentacao: produtos.map((p) => ({
          produto_id: Number(p.produto_id),
          quantidade: Number(p.quantidade),
        })),
      };
      await enviarMovimentacao(payload);
      Alert.alert('Movimentação salva com sucesso');
      setProdutos([]);
      setLocalizacaoId(null);
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
    <View style={styles.container}>
      <Text style={styles.title}>Movimentação - {tipo.toUpperCase()}</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleBtn, tipo === 'entrada' && styles.active]}
          onPress={() => handleTipoChange('entrada')}
        >
          <Text style={styles.toggleText}>ENTRADA</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, tipo === 'saida' && styles.active]}
          onPress={() => handleTipoChange('saida')}
        >
          <Text style={styles.toggleText}>SAÍDA</Text>
        </TouchableOpacity>
      </View>

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

      <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar}>
        <Text style={styles.salvarText}>Salvar</Text>
      </TouchableOpacity>
    </View>
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
  salvarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
