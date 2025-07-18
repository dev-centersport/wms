import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  StyleSheet,
  Text
} from 'react-native';
import {
  buscarLocalizacaoPorEAN,
  buscarProdutoPorEAN,
  enviarMovimentacao,
  buscarProdutosPorLocalizacaoDireto,
} from '../api/movimentacaoAPI';
import { useNavigation } from '@react-navigation/native';

import HeaderMovimentacao from '../componentes/Movimentacao/HeaderMovimentacao';
import InputLocalizacaoProduto from '../componentes/Movimentacao/InputLocalizacaoProduto';
import ListaProdutos from '../componentes/Movimentacao/ListaProdutos';
import BotoesMovimentacao from '../componentes/Movimentacao/BotoesMovimentacao';
import ModalConfirmacao from '../componentes/Movimentacao/ModalConfirmacao';
import ModalCancelar from '../componentes/Movimentacao/ModalCancelar';

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

  const localizacaoRef = useRef(null);
  const produtoRef = useRef(null);
  const flatListRef = useRef(null);
  const navigation = useNavigation();

  const limparCodigo = (valor) => valor.replace(/[\n\r\t\s]/g, '').trim();

  useEffect(() => {
    if (!tipoBloqueado && localizacaoRef.current) {
      requestAnimationFrame(() => localizacaoRef.current.focus());
    }
  }, [tipo, tipoBloqueado]);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [produtos]);

  const handleBuscarLocalizacao = async (eanBipado) => {
    const ean = limparCodigo(eanBipado || eanLocalizacao);
    if (!ean) return;
    try {
      const loc = await buscarLocalizacaoPorEAN(ean);
      if (!loc || !loc.localizacao_id) {
        Alert.alert('Localização não encontrada');
        return;
      }
      setlocalizacao_id(loc.localizacao_id);
      setNomeLocalizacao(`${loc.nome} - ${loc.armazem}`);
      setTipoBloqueado(true);
      setEanLocalizacao('');
      const produtosExistentes = await buscarProdutosPorLocalizacaoDireto(loc.localizacao_id);
      setProdutosNaLocalizacao(produtosExistentes);
      requestAnimationFrame(() => produtoRef.current?.focus());
    } catch {
      Alert.alert('Erro ao buscar localização');
    }
  };

  const handleAdicionarProduto = async (eanBipado) => {
    const ean = limparCodigo(eanBipado || eanProduto);
    if (!localizacao_id) {
      Alert.alert('Bipe uma localização antes de bipar produtos.');
      return;
    }
    try {
      const produto = await buscarProdutoPorEAN(ean);
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
      setProdutos((prev) => [...prev, produtoFormatado]);
      setEanProduto('');
      requestAnimationFrame(() => produtoRef.current?.focus());
    } catch {
      Alert.alert('Produto não encontrado');
    }
  };

  const verificarEstoqueAntesDeConfirmar = () => {
    if (tipo === 'saida') {
      const contador = {};
      const descricoes = {};
      produtos.forEach((p) => {
        contador[p.produto_id] = (contador[p.produto_id] || 0) + 1;
        descricoes[p.produto_id] = p.descricao;
      });
      for (const [produto_id, bipadoQtd] of Object.entries(contador)) {
        const existente = produtosNaLocalizacao.find(p => Number(p.produto_id) === Number(produto_id));
        const estoque = existente?.quantidade ?? 0;
        if (bipadoQtd > estoque) {
          Alert.alert(
            '⚠️ Estoque insuficiente',
            `📦 Produto: ${descricoes[produto_id]}\n🔢 Bipagens: ${bipadoQtd}\n📉 Estoque disponível: ${estoque}`
          );
          return;
        }
      }
    }
    setMostrarConfirmacao(true);
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
    requestAnimationFrame(() => localizacaoRef.current?.focus());
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <FlatList
        ref={flatListRef}
        data={produtos}
        keyExtractor={(_, index) => index.toString()}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.container}
        ListHeaderComponent={
          <View>
            <HeaderMovimentacao
              tipo={tipo}
              setTipo={setTipo}
              tipoBloqueado={tipoBloqueado}
              localizacao_id={localizacao_id}
              setEanLocalizacao={setEanLocalizacao}
              setlocalizacao_id={setlocalizacao_id}
              setNomeLocalizacao={setNomeLocalizacao}
              setProdutos={setProdutos}
              localizacaoRef={localizacaoRef}
            />

            <InputLocalizacaoProduto
              localizacao_id={localizacao_id}
              eanLocalizacao={eanLocalizacao}
              setEanLocalizacao={(v) => setEanLocalizacao(limparCodigo(v))}
              handleBuscarLocalizacao={({ nativeEvent }) => handleBuscarLocalizacao(nativeEvent.text)}
              nomeLocalizacao={nomeLocalizacao}
              eanProduto={eanProduto}
              setEanProduto={(v) => setEanProduto(limparCodigo(v))}
              handleAdicionarProduto={({ nativeEvent }) => handleAdicionarProduto(nativeEvent.text)}
              localizacaoRef={localizacaoRef}
              produtoRef={produtoRef}
              produtos={produtos}
            />

            {produtos.length > 0 && (
              <View style={{ marginBottom: 6 }}>
                <Text style={{ textAlign: 'right', fontWeight: 'bold', color: '#555' }}>
                  {produtos.length} produto(s) bipado(s)
                </Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item, index }) => (
          <ListaProdutos produto={item} index={index} />
        )}
        ListFooterComponent={
          <BotoesMovimentacao
            visible={!!localizacao_id}
            onSalvar={verificarEstoqueAntesDeConfirmar}
            onCancelar={() => setMostrarCancelar(true)}
          />
        }
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
        onCancelar={() => {
          setMostrarCancelar(false);
          limparTudo();
        }}
        tipo={tipo}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
});
