import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
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
  const produtoRef = useRef(null);

  // Buscar localização por EAN
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

      // Foco no input do produto
      setTimeout(() => {
        produtoRef.current?.focus();
      }, 100);
    } catch (err) {
      Alert.alert('Erro ao buscar localização');
    }
  };

  // Adicionar produto à lista
  const handleAdicionarProduto = async () => {
    try {
      const produto = await buscarProdutoPorEAN(eanProduto.trim());

      if (!produto || !produto.produto_estoque_id) {
        Alert.alert('Produto inválido');
        return;
      }

      setProdutos((prev) => [...prev, { ...produto, quantidade: 1 }]);
      setEanProduto('');

      // Mantém foco no input de produto
      setTimeout(() => {
        produtoRef.current?.focus();
      }, 100);
    } catch (err) {
      Alert.alert('Produto não encontrado');
    }
  };

  // Salvar movimentação
  const handleSalvar = async () => {
    if (!localizacaoId || produtos.length === 0) {
      Alert.alert('Preencha localização e produtos');
      return;
    }

    try {
      const payload = {
        tipo,
        usuario_id: 1,
        localizacao_origem_id: tipo === 'saida' ? localizacaoId : null,
        localizacao_destino_id: tipo === 'entrada' ? localizacaoId : null,
        itens_movimentacao: produtos.map((p) => ({
          produto_estoque_id: Number(p.produto_estoque_id),
          quantidade: Number(p.quantidade),
        })),
      };

      console.log('📦 Enviando movimentação:', payload);
      await enviarMovimentacao(payload);

      Alert.alert('Movimentação salva com sucesso');
      setProdutos([]);
      setLocalizacaoId(null);
      setEanLocalizacao('');
      setNomeLocalizacao('');
      setEanProduto('');
    } catch (err) {
      Alert.alert('Erro ao salvar movimentação');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Movimentação - {tipo.toUpperCase()}</Text>

      {/* Botões Entrada/Saída */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleBtn, tipo === 'entrada' && styles.active]}
          onPress={() => setTipo('entrada')}
        >
          <Text style={styles.toggleText}>ENTRADA</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, tipo === 'saida' && styles.active]}
          onPress={() => setTipo('saida')}
        >
          <Text style={styles.toggleText}>SAÍDA</Text>
        </TouchableOpacity>
      </View>

      {/* EAN Localização */}
      <TextInput
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

      {/* EAN Produto */}
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

      {/* Lista de Produtos */}
      <FlatList
        data={produtos}
        keyExtractor={(item, index) => index.toString()}
        style={{ marginTop: 10 }}
        renderItem={({ item }) => (
          <Text style={styles.item}>
            {item.descricao} - {item.ean}
          </Text>
        )}
      />

      {/* Botão Salvar */}
      <TouchableOpacity style={styles.btnSalvar} onPress={handleSalvar}>
        <Text style={styles.salvarText}>SALVAR</Text>
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
  item: {
    padding: 8,
    borderBottomWidth: 1,
    borderColor: '#eee',
    fontSize: 16,
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
