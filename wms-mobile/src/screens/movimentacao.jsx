import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  StyleSheet,
  Text,
  Dimensions
} from 'react-native';
import {
  buscarLocalizacaoPorEAN,
  buscarProdutoPorEAN,
  enviarMovimentacao,
  buscarProdutosPorLocalizacaoDireto,
  abrirLocalizacao,
  fecharLocalizacao,
  obterUsuarioLogado,
} from '../api/movimentacaoAPI';
import { useNavigation } from '@react-navigation/native';
import { useMovimentacaoPerformance } from '../hooks/useMovimentacaoPerformance';

import HeaderMovimentacao from '../componentes/Movimentacao/HeaderMovimentacao';
import InputLocalizacaoProduto from '../componentes/Movimentacao/InputLocalizacaoProduto';
import ListaProdutos from '../componentes/Movimentacao/ListaProdutos';
import BotoesMovimentacao from '../componentes/Movimentacao/BotoesMovimentacao';
import ModalConfirmacao from '../componentes/Movimentacao/ModalConfirmacao';
import ModalCancelar from '../componentes/Movimentacao/ModalCancelar';
import ModalExcluirProduto from '../componentes/Movimentacao/ModalExcluirProduto';

// Cache para produtos já buscados
const produtoCache = new Map();
const localizacaoCache = new Map();

export default function Movimentacao() {
  const [tipo, setTipo] = useState('entrada');
  const [tipoBloqueado, setTipoBloqueado] = useState(false);
  const [eanLocalizacao, setEanLocalizacao] = useState('');
  const [localizacao_id, setlocalizacao_id] = useState(null);
  const [nomeLocalizacao, setNomeLocalizacao] = useState('');
  const [eanProduto, setEanProduto] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [produtosNaLocalizacao, setProdutosNaLocalizacao] = useState([]);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [mostrarCancelar, setMostrarCancelar] = useState(false);
  const [indexExcluir, setIndexExcluir] = useState(null);
  const [mostrarModalExcluir, setMostrarModalExcluir] = useState(false);
  const [eanLocalizacaoAberta, setEanLocalizacaoAberta] = useState('');
  const [carregando, setCarregando] = useState(false);

  const localizacaoRef = useRef(null);
  const produtoRef = useRef(null);
  const flatListRef = useRef(null);
  const navigation = useNavigation();

  // Hook de performance
  const {
    throttleBip,
    optimizedScrollToEnd,
    getCachedValue,
    setCachedValue,
  } = useMovimentacaoPerformance();

  const limparCodigo = useCallback((valor) => valor.replace(/[\n\r\t\s]/g, '').trim(), []);

  // Memoizar produtos agrupados para evitar recálculos desnecessários
  const produtosAgrupados = useMemo(() => {
    const agrupados = {};
    produtos.forEach((produto, index) => {
      const key = produto.produto_id;
      if (!agrupados[key]) {
        agrupados[key] = {
          ...produto,
          indices: [],
          quantidade_total: 0
        };
      }
      agrupados[key].indices.push(index);
      agrupados[key].quantidade_total += 1;
    });
    return Object.values(agrupados);
  }, [produtos]);

  useEffect(() => {
    if (!tipoBloqueado && localizacaoRef.current) {
      requestAnimationFrame(() => localizacaoRef.current.focus());
    }
  }, [tipo, tipoBloqueado]);

  // Otimizar scroll automático
  useEffect(() => {
    if (produtos.length > 0) {
      throttleBip(() => {
        optimizedScrollToEnd(flatListRef);
      }, 100);
    }
  }, [produtos.length, throttleBip, optimizedScrollToEnd]);

  const handleBuscarLocalizacao = useCallback(async (eanBipado) => {
    const ean = limparCodigo(eanBipado || eanLocalizacao);
    if (!ean || carregando) return;

    // Verificar cache primeiro
    const cachedLoc = getCachedValue(`loc_${ean}`);
    if (cachedLoc) {
      setlocalizacao_id(cachedLoc.localizacao_id);
      setNomeLocalizacao(cachedLoc.nome);
      setTipoBloqueado(true);
      setEanLocalizacao('');
      requestAnimationFrame(() => produtoRef.current?.focus());
      return;
    }

    setCarregando(true);
    try {
      const loc = await buscarLocalizacaoPorEAN(ean);
      if (!loc || !loc.localizacao_id) {
        Alert.alert('Localização não encontrada');
        return;
      }

      // Cache da localização
      const locData = {
        localizacao_id: loc.localizacao_id,
        nome: `${loc.nome} - ${loc.armazem}`
      };
      setCachedValue(`loc_${ean}`, locData);

      // Abrir localização em paralelo com outras operações
      const abrirPromise = abrirLocalizacao(ean);
      
      setlocalizacao_id(loc.localizacao_id);
      setNomeLocalizacao(locData.nome);
      setTipoBloqueado(true);
      setEanLocalizacao('');

      // Executar operações em paralelo
      const [_, produtosExistentes] = await Promise.all([
        abrirPromise.then(() => setEanLocalizacaoAberta(ean)),
        buscarProdutosPorLocalizacaoDireto(loc.localizacao_id)
      ]);

      setProdutosNaLocalizacao(produtosExistentes);
      requestAnimationFrame(() => produtoRef.current?.focus());
    } catch (error) {
      setEanLocalizacao('');
      Alert.alert('Erro ao buscar localização');
    } finally {
      setCarregando(false);
    }
  }, [eanLocalizacao, carregando, limparCodigo, getCachedValue, setCachedValue]);

  // Debounced effect para busca automática de localização
  useEffect(() => {
    if (eanLocalizacao && eanLocalizacao.length >= 3) {
      const timer = setTimeout(() => {
        handleBuscarLocalizacao(eanLocalizacao);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [eanLocalizacao, handleBuscarLocalizacao]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', async (e) => {
      // Travar saída se localização estiver bipada
      if (localizacao_id) {
        e.preventDefault();

        Alert.alert(
          'Movimentação em Andamento',
          'Você tem uma movimentação em andamento. Finalize ou cancele a operação antes de sair.',
          [
            { 
              text: 'Continuar Movimentação', 
              style: 'cancel', 
              onPress: () => { } 
            },
            {
              text: 'Cancelar e Sair',
              style: 'destructive',
              onPress: async () => {
                try {
                  // Fechar localização se estiver aberta
                  if (eanLocalizacaoAberta) {
                    await fecharLocalizacao(eanLocalizacaoAberta);
                    setEanLocalizacaoAberta('');
                  }
                } catch (err) {
                  console.log('[ERRO][SAIR] Erro ao fechar localização ao sair:', err);
                }
                limparTudo();
                navigation.dispatch(e.data.action);
              },
            },
          ]
        );
      }
    });
    return unsubscribe;
  }, [navigation, localizacao_id, eanLocalizacaoAberta, limparTudo]);

  const handleAdicionarProduto = useCallback(async (eanBipado) => {
    const ean = limparCodigo(eanBipado || eanProduto);
    if (!localizacao_id || carregando) {
      if (!localizacao_id) {
        Alert.alert('Bipe uma localização antes de bipar produtos.');
      }
      setEanProduto('');
      return;
    }

    // Verificar cache primeiro
    const cachedProduto = getCachedValue(`prod_${ean}`);
    if (cachedProduto) {
      const produtoFormatado = {
        produto_id: cachedProduto.produto_id,
        descricao: cachedProduto.descricao || "",
        sku: cachedProduto.sku || "",
        ean: cachedProduto.ean || "",
        url_foto: cachedProduto.url_foto || "",
      };

      setProdutos(prev => [...prev, produtoFormatado]);
      setEanProduto('');
      requestAnimationFrame(() => produtoRef.current?.focus());
      return;
    }

    setCarregando(true);
    try {
      const produto = await buscarProdutoPorEAN(ean);
      if (!produto || !produto.produto_id) {
        Alert.alert('Produto inválido');
        setEanProduto('');
        return;
      }

      // Cache do produto
      setCachedValue(`prod_${ean}`, produto);

      // Verifica se o produto existe na localização atual
      const estoque = produtosNaLocalizacao.find(
        (p) => Number(p.produto_id) === Number(produto.produto_id)
      );

      if (tipo === 'saida' && !estoque) {
        Alert.alert('Produto não localizado na gaveta, portanto foi excluído da lista.');
        setEanProduto('');
        requestAnimationFrame(() => produtoRef.current?.focus());
        return;
      }

      const produtoFormatado = {
        produto_id: produto.produto_id,
        descricao: produto.descricao || "",
        sku: produto.sku || "",
        ean: produto.ean || "",
        url_foto: produto.url_foto || "",
      };

      setProdutos(prev => [...prev, produtoFormatado]);
      setEanProduto('');
      requestAnimationFrame(() => produtoRef.current?.focus());
    } catch (error) {
      setEanProduto('');
      Alert.alert('Erro ao buscar produto');
    } finally {
      setCarregando(false);
    }
  }, [localizacao_id, eanProduto, carregando, tipo, produtosNaLocalizacao, limparCodigo, getCachedValue, setCachedValue]);

  // Debounced effect para busca automática de produto
  useEffect(() => {
    if (eanProduto && eanProduto.length >= 3 && localizacao_id) {
      const timer = setTimeout(() => {
        handleAdicionarProduto(eanProduto);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [eanProduto, handleAdicionarProduto, localizacao_id]);

  const handleLongPressExcluir = useCallback((index) => {
    setIndexExcluir(index);
    setMostrarModalExcluir(true);
  }, []);

  const confirmarExclusao = useCallback(() => {
    if (indexExcluir !== null) {
      setProdutos(prev => prev.filter((_, index) => index !== indexExcluir));
      setIndexExcluir(null);
      setMostrarModalExcluir(false);
    }
  }, [indexExcluir]);

  const verificarEstoqueAntesDeConfirmar = useCallback(() => {
    if (produtos.length === 0) {
      Alert.alert('Adicione pelo menos um produto antes de confirmar.');
      return;
    }
    setMostrarConfirmacao(true);
  }, [produtos.length]);

  const agruparProdutos = useCallback((lista) => {
    const agrupados = {};
    lista.forEach((produto, index) => {
      const key = produto.produto_id;
      if (!agrupados[key]) {
        agrupados[key] = {
          produto_id: produto.produto_id,
          descricao: produto.descricao,
          sku: produto.sku,
          ean: produto.ean,
          quantidade: 0,
          indices: []
        };
      }
      agrupados[key].quantidade += 1;
      agrupados[key].indices.push(index);
    });
    return Object.values(agrupados);
  }, []);

  const handleConfirmar = useCallback(async () => {
    if (produtos.length === 0) {
      Alert.alert('Adicione pelo menos um produto antes de confirmar.');
      return;
    }

    setCarregando(true);
    try {
      const produtosAgrupados = agruparProdutos(produtos);
      const usuario = await obterUsuarioLogado();

      const payload = {
        tipo,
        localizacao_id,
        usuario_id: usuario.usuario_id,
        produtos: produtosAgrupados.map(p => ({
          produto_id: p.produto_id,
          quantidade: p.quantidade
        }))
      };

      await enviarMovimentacao(payload);
      
      Alert.alert('Sucesso', 'Movimentação realizada com sucesso!');
      limparTudo();
    } catch (error) {
      Alert.alert('Erro', 'Erro ao realizar movimentação. Tente novamente.');
    } finally {
      setCarregando(false);
      setMostrarConfirmacao(false);
    }
  }, [produtos, tipo, localizacao_id, agruparProdutos]);

  const limparTudo = useCallback(() => {
    setEanLocalizacao('');
    setlocalizacao_id(null);
    setNomeLocalizacao('');
    setEanProduto('');
    setProdutos([]);
    setProdutosNaLocalizacao([]);
    setTipoBloqueado(false);
    setEanLocalizacaoAberta('');
  }, []);

  const onCancelarMovimentacao = useCallback(async () => {
    try {
      if (eanLocalizacaoAberta) {
        await fecharLocalizacao(eanLocalizacaoAberta);
        setEanLocalizacaoAberta('');
      }
    } catch (err) {
      console.log('[ERRO][CANCELAR] Erro ao fechar localização ao cancelar:', err);
      Alert.alert('Erro ao fechar localização', err?.message || 'Tente novamente');
    }
    limparTudo();
  }, [eanLocalizacaoAberta, limparTudo]);

  // Memoizar renderItem para evitar re-renders desnecessários
  const renderItem = useCallback(({ item, index }) => (
    <ListaProdutos produto={item} index={index} onLongPress={handleLongPressExcluir} />
  ), [handleLongPressExcluir]);

  // Memoizar keyExtractor
  const keyExtractor = useCallback((_, index) => index.toString(), []);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        <HeaderMovimentacao
          localizacao_id={localizacao_id}
          eanLocalizacaoAberta={eanLocalizacaoAberta}
          onCancelarMovimentacao={onCancelarMovimentacao}
        />

        <InputLocalizacaoProduto
          localizacao_id={localizacao_id}
          eanLocalizacao={eanLocalizacao}
          setEanLocalizacao={(v) => setEanLocalizacao(limparCodigo(v))}
          handleBuscarLocalizacao={handleBuscarLocalizacao}
          nomeLocalizacao={nomeLocalizacao}
          eanProduto={eanProduto}
          setEanProduto={(v) => setEanProduto(limparCodigo(v))}
          handleAdicionarProduto={({ nativeEvent }) => handleAdicionarProduto(nativeEvent.text)}
          localizacaoRef={localizacaoRef}
          produtoRef={produtoRef}
          produtos={produtos}
          carregando={carregando}
        />

        {produtos.length > 0 && (
          <View style={styles.resumoSKUs}>
            <Text style={styles.totalTexto}>
              {produtos.length} produto(s) bipado(s)
            </Text>
          </View>
        )}

        <View style={styles.listaContainer}>
          <FlatList
            ref={flatListRef}
            data={produtos}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={true}
            maxToRenderPerBatch={6}
            windowSize={6}
            initialNumToRender={6}
            updateCellsBatchingPeriod={20}
            getItemLayout={(data, index) => ({
              length: 68,
              offset: 68 * index,
              index,
            })}
            showsVerticalScrollIndicator={true}
            indicatorStyle="black"
          />
        </View>

        <BotoesMovimentacao
          visible={!!localizacao_id}
          onSalvar={verificarEstoqueAntesDeConfirmar}
          onCancelar={() => setMostrarCancelar(true)}
          carregando={carregando}
        />

        <ModalConfirmacao
          visible={mostrarConfirmacao}
          onClose={() => setMostrarConfirmacao(false)}
          onConfirmar={handleConfirmar}
          tipo={tipo}
          quantidade={produtos.length}
        />

        <ModalCancelar
          visible={mostrarCancelar}
          onClose={() => setMostrarCancelar(false)}
          onCancelar={onCancelarMovimentacao}
          tipo="movimentação"
        />

        <ModalExcluirProduto
          visible={mostrarModalExcluir}
          onConfirmar={confirmarExclusao}
          onClose={() => setMostrarModalExcluir(false)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
  },
  resumoSKUs: {
    marginTop: 8,
    marginBottom: 4,
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  totalTexto: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  listaContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
});
