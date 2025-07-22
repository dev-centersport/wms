import React, { useState, useRef, useEffect } from 'react';
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
} from '../api/movimentacaoAPI';
import { useNavigation } from '@react-navigation/native';

import HeaderMovimentacao from '../componentes/Movimentacao/HeaderMovimentacao';
import InputLocalizacaoProduto from '../componentes/Movimentacao/InputLocalizacaoProduto';
import ListaProdutos from '../componentes/Movimentacao/ListaProdutos';
import BotoesMovimentacao from '../componentes/Movimentacao/BotoesMovimentacao';
import ModalConfirmacao from '../componentes/Movimentacao/ModalConfirmacao';
import ModalCancelar from '../componentes/Movimentacao/ModalCancelar';
import ModalExcluirProduto from '../componentes/Movimentacao/ModalExcluirProduto';

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
      setEanProduto('');
      return;
    }

    try {
      const produto = await buscarProdutoPorEAN(ean);
      if (!produto || !produto.produto_id) {
        Alert.alert('Produto inválido');
        setEanProduto('');
        return;
      }

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
        produto_estoque_id: estoque?.produto_estoque_id || null, // ⬅️ ESSENCIAL
        descricao: produto.descricao,
        ean: produto.ean,
        sku: produto.sku,
        url_foto: produto.url_foto,
        quantidade: 1,
        estoque_localizacao: estoque?.quantidade || 0,
      };

      setProdutos((prev) => [...prev, produtoFormatado]);
      setEanProduto('');
      requestAnimationFrame(() => produtoRef.current?.focus());
    } catch {
      Alert.alert('Produto não encontrado');
      setEanProduto('');
    }
  };

  const handleLongPressExcluir = (index) => {
    setIndexExcluir(index);
    setMostrarModalExcluir(true);
  };

  const confirmarExclusao = () => {
    if (indexExcluir !== null) {
      setProdutos((prev) => prev.filter((_, i) => i !== indexExcluir));
      setIndexExcluir(null);
      setMostrarModalExcluir(false);
    }
  };

  const verificarEstoqueAntesDeConfirmar = () => {
    if (tipo === 'saida') {
      const payload = {
        tipo,
        usuario_id: 1,
        localizacao_origem_id: localizacao_id,
        localizacao_destino_id: 0,
        itens_movimentacao: agruparProdutos(produtos),
      };

      console.log("📦 Payload (pré-verificação):", JSON.stringify(payload, null, 2));

      const contador = {};
      const descricoes = {};
      produtos.forEach((p) => {
        contador[p.produto_id] = (contador[p.produto_id] || 0) + 1;
        descricoes[p.produto_id] = p.descricao;
      });

      for (const [produto_id, bipadoQtd] of Object.entries(contador)) {
        const existente = produtosNaLocalizacao.find(
          (p) => Number(p.produto_id) === Number(produto_id)
        );
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


  const agruparProdutos = (lista) => {
    const mapa = {};
    for (const p of lista) {
      const id = p.produto_id;
      if (!id) continue;

      if (!mapa[id]) {
        mapa[id] = {
          produto_id: Number(p.produto_id),
          produto_estoque_id: Number(p.produto_estoque_id),
          quantidade: 0,
        };
      }
      mapa[id].quantidade += 1;
    }
    return Object.values(mapa);
  };


  const handleConfirmar = async () => {
    setMostrarConfirmacao(false);

    try {
      // 🚨 Verificações explícitas antes do payload
      if (!tipo) {
        console.error('❌ Tipo de movimentação não definido');
        Alert.alert('Tipo de movimentação inválido');
        return;
      }

      if (!localizacao_id || isNaN(Number(localizacao_id))) {
        console.error('❌ ID de localização inválido:', localizacao_id);
        Alert.alert('Localização inválida ou não encontrada');
        return;
      }

      if (!Array.isArray(produtos) || produtos.length === 0) {
        console.error('❌ Nenhum produto bipado para movimentação');
        Alert.alert('Nenhum produto foi bipado');
        return;
      }

      // 🔄 Agrupar produtos antes de montar payload
      const itensAgrupados = agruparProdutos(produtos);
      console.log('📦 Produtos agrupados:', JSON.stringify(itensAgrupados, null, 2));

      // 🎯 Definição explícita dos campos de localização
      const localizacao_origem_id = tipo === 'saida' ? localizacao_id : 0;
      const localizacao_destino_id = tipo === 'entrada' ? localizacao_id : 0;

      console.log(`➡️ tipo: ${tipo}`);
      console.log(`➡️ localizacao_origem_id (${typeof localizacao_origem_id}):`, localizacao_origem_id);
      console.log(`➡️ localizacao_destino_id (${typeof localizacao_destino_id}):`, localizacao_destino_id);

      // 🧾 Payload final
      const payload = {
        tipo,
        usuario_id: 1,
        localizacao_origem_id,
        localizacao_destino_id,
        itens_movimentacao: itensAgrupados,
      };

      console.log('✅ Payload final a ser enviado:', JSON.stringify(payload, null, 2));

      const resposta = await enviarMovimentacao(payload);

      console.log('✅ Movimentação salva com sucesso:', resposta);
      Alert.alert('Movimentação salva com sucesso');
      limparTudo();

    } catch (err) {
      console.error('❌ Erro ao salvar movimentação:', err);

      if (err.response?.data) {
        console.error('🔍 Detalhe do erro:', JSON.stringify(err.response.data, null, 2));
        Alert.alert('Erro:', err.response.data?.message?.[0] || 'Erro ao salvar movimentação');
      } else if (err.message) {
        Alert.alert('Erro:', err.message);
      } else {
        Alert.alert('Erro ao salvar movimentação');
      }
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
      <View style={styles.container}>
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
          handleBuscarLocalizacao={handleBuscarLocalizacao}
          nomeLocalizacao={nomeLocalizacao}
          eanProduto={eanProduto}
          setEanProduto={(v) => setEanProduto(limparCodigo(v))}
          handleAdicionarProduto={({ nativeEvent }) => handleAdicionarProduto(nativeEvent.text)}
          localizacaoRef={localizacaoRef}
          produtoRef={produtoRef}
          produtos={produtos}
        />


        {produtos.length > 0 && (
          <View style={styles.resumoSKUs}>
            <Text style={styles.totalTexto}>
            </Text>
            <Text style={styles.totalTexto}>
              {produtos.length} produto(s) bipado(s)
            </Text>
          </View>
        )}

        <View style={styles.listaContainer}>
          <FlatList
            ref={flatListRef}
            data={produtos}
            keyExtractor={(_, index) => index.toString()}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item, index }) => (
              <ListaProdutos produto={item} index={index} onLongPress={handleLongPressExcluir} />
            )}
          />
        </View>

        <BotoesMovimentacao
          visible={!!localizacao_id}
          onSalvar={verificarEstoqueAntesDeConfirmar}
          onCancelar={() => setMostrarCancelar(true)}
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

        <ModalExcluirProduto
          visible={mostrarModalExcluir}
          onConfirmar={confirmarExclusao}
          onClose={() => setMostrarModalExcluir(false)}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  resumoSKUs: {
    marginTop: 10,
    marginBottom: 6,
    alignItems: 'flex-end',
  },
  totalTexto: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  listaContainer: {
    flexGrow: 1,
    maxHeight: screenHeight * 0.37, // 40% da altura da tela (ajuste se necessário)
    borderTopWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
  },
});
