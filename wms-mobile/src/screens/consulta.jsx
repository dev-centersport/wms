// screens/ConsultaScreen.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buscarConsultaEstoque } from '../api/consultaAPI';
import { Colors, Spacing } from '../../constants/Colors';

// Componentes
import HeaderConsulta from '../componentes/Consulta/HeaderConsulta';
import SearchBarConsulta from '../componentes/Consulta/SearchBarConsulta';
import { TableHeader, TableBody } from '../componentes/Consulta/TableConsulta';
import PaginacaoConsulta from '../componentes/Consulta/PaginacaoConsulta';
import EmptyState from '../componentes/Consulta/EmptyState';

export default function ConsultaScreen({ navigation }) {
  const [busca, setBusca] = useState('');
  const [dados, setDados] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [inputPagina, setInputPagina] = useState('');
  const [modalVisivel, setModalVisivel] = useState(false);

  const itensPorPagina = 50;

  const realizarBusca = async () => {
    if (busca.trim().length < 2) return;

    try {
      const resultado = await buscarConsultaEstoque(busca);
      setDados(resultado);
      setPaginaAtual(1);
      setTotalPaginas(Math.ceil(resultado.length / itensPorPagina));
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
    }
  };

  const dadosPaginados = () => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return dados.slice(inicio, inicio + itensPorPagina);
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
      <SearchBarConsulta value={busca} onChange={setBusca} onSubmit={realizarBusca} />
      
      <View style={[styles.content, { marginTop: dados.length > 0 ? Spacing.sm : Spacing.xl }]}>
        {dados.length === 0 ? (
          <EmptyState texto="Digite e pressione Enter para pesquisar um produto." />
        ) : (
          <>
            <TableHeader />
            <TableBody data={dadosPaginados()} />
          </>
        )}
      </View>

      {dados.length > 0 && (
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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
  },
});
