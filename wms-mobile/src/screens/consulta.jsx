import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const dadosMock = Array.from({ length: 153 }, (_, i) => ({
  id: i + 1,
  sku: `Produto ${i + 1}`,
  localizacao: `Prateleira ${((i % 5) + 1)}`,
  quantidade: Math.floor(Math.random() * 20) + 1,
}));

export default function ConsultaScreen({ navigation }) {
  const [busca, setBusca] = useState('');
  const [dados, setDados] = useState(dadosMock);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [inputPagina, setInputPagina] = useState('');
  const [modalVisivel, setModalVisivel] = useState(false);

  const itensPorPagina = 10;

  useEffect(() => {
    setTotalPaginas(Math.ceil(dados.length / itensPorPagina));
  }, [dados]);

  const filtrarDados = () => {
    const termo = busca.toLowerCase();
    return dados.filter((item) =>
      item.sku.toLowerCase().includes(termo)
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
        <Text style={[styles.tableCell, { flex: 2 }]}>Localizacao</Text>
        <Text style={[styles.tableCell, { flex: 1 }]}>Qtd</Text>
      </View>

      {/* Lista de itens */}
      <FlatList
        data={dadosPaginados()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 2 }]}>{item.sku}</Text>
            <Text style={[styles.tableCell, { flex: 2 }]}>{item.localizacao}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{item.quantidade}</Text>
          </View>
        )}
        style={{ flex: 1 }}
      />

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

      {/* Botão de filtro */}
      <TouchableOpacity style={styles.filtroBtn}>
        <Text style={styles.filtroText}>Filtro</Text>
      </TouchableOpacity>
    </View>
  );
}
