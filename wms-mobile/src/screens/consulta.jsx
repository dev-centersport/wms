import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { buscarConsultaEstoque } from '../api/index'; // ajuste o caminho conforme seu projeto

export default function ConsultaScreen({ navigation }) {
  const [busca, setBusca] = useState('');
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [inputPagina, setInputPagina] = useState('');
  const [modalVisivel, setModalVisivel] = useState(false);

  const itensPorPagina = 50;

  useEffect(() => {
    async function carregar() {
      try {
        const resposta = await buscarConsultaEstoque();
        setDados(resposta);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  useEffect(() => {
    setTotalPaginas(Math.ceil(filtrarDados().length / itensPorPagina));
    setPaginaAtual(1);
  }, [dados, busca]);

  const filtrarDados = () => {
    const termo = busca.toLowerCase();
    return dados.filter(
      (item) =>
        item.sku.toLowerCase().includes(termo) ||
        item.ean.toLowerCase().includes(termo) ||
        item.descricao.toLowerCase().includes(termo)
    );
  };

  const dadosPaginados = () => {
    const filtrado = filtrarDados();
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return filtrado.slice(inicio, inicio + itensPorPagina);
  };

  const irParaPagina = (numero) => {
    const n = parseInt(numero);
    if (!isNaN(n) && n >= 1 && n <= totalPaginas) {
      setPaginaAtual(n);
    }
    setModalVisivel(false);
    setInputPagina('');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>consulta</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Input de busca */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Nome, SKU ou EAN"
          style={styles.searchInput}
          value={busca}
          onChangeText={setBusca}
          placeholderTextColor="#888"
        />
        <Ionicons name="search" size={20} color="green" style={{ marginLeft: 10 }} />
      </View>

      {/* Cabeçalho da lista */}
      <View style={styles.tableHeader}>
        <Text style={[styles.tableCell, { flex: 2 }]}>SKU</Text>
        <Text style={[styles.tableCell, { flex: 2 }]}>Localização</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>Qtd</Text>
      </View>

      {/* Lista */}
      {carregando ? (
        <ActivityIndicator size="large" color="green" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={dadosPaginados()}
          keyExtractor={(item, index) => `${item.sku}-${index}`}
          renderItem={({ item }) => (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{item.sku}</Text>
              <Text style={[styles.tableCell, { flex: 2 }]}>{item.localizacao}</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>{item.quantidade}</Text>
            </View>
          )}
          style={{ flex: 1 }}
        />
      )}

      {/* Paginação */}
      <View style={styles.pagination}>
        <TouchableOpacity
          style={styles.pageBtn}
          onPress={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
        >
          <Text style={styles.pageText}>◀</Text>
        </TouchableOpacity>

        <Text style={styles.pageText}>{paginaAtual}</Text>

        {paginaAtual < totalPaginas - 2 && (
          <>
            <Text style={styles.pageText}>...</Text>
            <Text style={styles.pageText}>{totalPaginas}</Text>
            <TouchableOpacity onPress={() => setModalVisivel(true)}>
              <Ionicons name="ellipsis-horizontal" size={20} color="green" style={{ marginLeft: 5 }} />
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.pageBtn}
          onPress={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
        >
          <Text style={styles.pageText}>▶</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de escolha de página */}
      <Modal visible={modalVisivel} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={{ marginBottom: 10 }}>Digite o número da página:</Text>
            <TextInput
              keyboardType="numeric"
              value={inputPagina}
              onChangeText={setInputPagina}
              placeholder="Ex: 3"
              style={styles.modalInput}
            />
            <TouchableOpacity style={styles.modalButton} onPress={() => irParaPagina(inputPagina)}>
              <Text style={styles.modalButtonText}>Ir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'lowercase',
  },
  searchContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f6f6f6',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderColor: '#ddd',
  },
  tableCell: {
    fontSize: 16,
    color: '#333',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  pageBtn: {
    paddingHorizontal: 10,
  },
  pageText: {
    fontSize: 16,
    marginHorizontal: 5,
  },
  filtroBtn: {
    alignSelf: 'center',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#61DE25',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  filtroText: {
    color: '#61DE25',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    width: 250,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 6,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#61DE25',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 6,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
