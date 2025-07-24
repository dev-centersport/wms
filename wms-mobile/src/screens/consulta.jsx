import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buscarConsultaEstoque } from '../api/consultaAPI';

// Componentes
import HeaderConsulta from '../componentes/Consulta/HeaderConsulta';
import SearchBarConsulta from '../componentes/Consulta/SearchBarConsulta';
import { TableHeader, TableBody } from '../componentes/Consulta/TableConsulta';
import PaginacaoConsulta from '../componentes/Consulta/PaginacaoConsulta';

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
    <SafeAreaView style={styles.container}>
      <HeaderConsulta onClose={() => navigation.goBack()} />
      <SearchBarConsulta value={busca} onChange={setBusca} />
      <TableHeader />

      {carregando ? (
        <ActivityIndicator size="large" color="green" style={{ marginTop: 40 }} />
      ) : (
        <TableBody data={dadosPaginados()} />
      )}

      <PaginacaoConsulta
        paginaAtual={paginaAtual}
        totalPaginas={totalPaginas}
        setPaginaAtual={setPaginaAtual}
        modalVisivel={modalVisivel}
        setModalVisivel={setModalVisivel}
        inputPagina={inputPagina}
        setInputPagina={setInputPagina}
        irParaPagina={irParaPagina}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingBottom: 30,
  },
});
