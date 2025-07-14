import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { buscarLocalizacoes, buscarConsultaEstoque } from '../api/index';

export default function Movimentacao() {
  const [tipo, setTipo] = useState('entrada');
  const [eanLocalizacao, setEanLocalizacao] = useState('');
  const [localizacaoId, setLocalizacaoId] = useState(null);
  const [eanProduto, setEanProduto] = useState('');
  const [produtos, setProdutos] = useState([]);

  // Buscar localização por EAN
  const handleBuscarLocalizacao = async () => {
    try {
      const lista = await buscarLocalizacoes();
      const encontrada = lista.find((l) => l.ean === eanLocalizacao.trim());
      if (!encontrada) {
        Alert.alert('Localização não encontrada');
        return;
      }
      setLocalizacaoId(encontrada.localizacao_id);
      Alert.alert('Localização encontrada:', encontrada.nome);
    } catch (err) {
      Alert.alert('Erro ao buscar localização');
    }
  };

  // Adicionar produto à lista
  const handleAdicionarProduto = async () => {
    try {
      const consulta = await buscarConsultaEstoque();
      const encontrado = consulta.find((p) => p.ean === eanProduto.trim());

      if (!encontrado) {
        Alert.alert('Produto não encontrado');
        return;
      }

      setProdutos((prev) => [...prev, { ...encontrado, quantidade: 1 }]);
      setEanProduto('');
    } catch (err) {
      Alert.alert('Erro ao adicionar produto');
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
        usuario_id: 1, // Ajuste conforme login
        localizacao_origem_id: tipo === 'saida' ? localizacaoId : null,
        localizacao_destino_id: tipo === 'entrada' ? localizacaoId : null,
        itens_movimentacao: produtos.map((p) => ({
          produto_estoque_id: p.produto_estoque_id || 0,
          quantidade: p.quantidade,
        })),
      };

      const res = await fetch('http://151.243.0.78:3001/movimentacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Erro ao enviar');

      Alert.alert('Movimentação salva com sucesso');
      setProdutos([]);
      setLocalizacaoId(null);
      setEanLocalizacao('');
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
        showSoftInputOnFocus={false} // Impede teclado
      />

      {/* EAN Produto */}
      <TextInput
        value={eanProduto}
        onChangeText={setEanProduto}
        onSubmitEditing={handleAdicionarProduto}
        placeholder="EAN do Produto"
        style={styles.input}
        keyboardType="numeric"
        showSoftInputOnFocus={false} // Impede teclado
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
