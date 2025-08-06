import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Alert,
  Platform,
  FlatList,
  StyleSheet,
  Text,
  Dimensions,
  SafeAreaView,
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
import { useAuth } from '../contexts/AuthContext';

import HeaderMovimentacao from '../componentes/Movimentacao/HeaderMovimentacao';
import InputLocalizacaoProduto from '../componentes/Movimentacao/InputLocalizacaoProduto';
import ListaProdutos from '../componentes/Movimentacao/ListaProdutos';
import BotoesMovimentacao from '../componentes/Movimentacao/BotoesMovimentacao';
import ModalConfirmacao from '../componentes/Movimentacao/ModalConfirmacao';
import ModalCancelar from '../componentes/Movimentacao/ModalCancelar';
import ModalExcluirProduto from '../componentes/Movimentacao/ModalExcluirProduto';

export default function Movimentacao() {
  const { user } = useAuth();
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

      try {
        await abrirLocalizacao(ean);
        setEanLocalizacaoAberta(ean);
      } catch (err) {
        Alert.alert('Erro ao abrir localização', err?.message || 'Tente novamente');
        return; // impede seguir se não conseguir abrir
      }

      setlocalizacao_id(loc.localizacao_id);
      setNomeLocalizacao(`${loc.armazem} - ${loc.nome}`);
      setTipoBloqueado(true);
      setEanLocalizacao('');
      const produtosExistentes = await buscarProdutosPorLocalizacaoDireto(loc.localizacao_id);
      setProdutosNaLocalizacao(produtosExistentes);
      requestAnimationFrame(() => produtoRef.current?.focus());
    } catch {
      setEanLocalizacao('');
      Alert.alert('Erro ao buscar localização');
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', async (e) => {
      if (localizacao_id && eanLocalizacaoAberta) {
        e.preventDefault();

        Alert.alert(
          'Atenção',
          'Você está saindo e a localização aberta será fechada. Confirma?',
          [
            { text: 'Cancelar', style: 'cancel', onPress: () => { } },
            {
              text: 'Fechar localização e sair',
              style: 'destructive',
              onPress: async () => {
                try {
                  console.log('[SAIR] Fechando localização EAN:', eanLocalizacaoAberta);
                  await fecharLocalizacao(eanLocalizacaoAberta);
                  setEanLocalizacaoAberta('');
                  console.log('[SAIR] Localização fechada ao sair');
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
  }, [navigation, localizacao_id, eanLocalizacaoAberta]);

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
        usuario_id: user?.usuario_id || 1, // 🔒 Usando o ID do usuário autenticado
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

      // 🔐 Obter usuário logado
      const currentUser = await obterUsuarioLogado();
      const usuario_id = currentUser.usuario_id;

      // 🧾 Payload final
      const payload = {
        tipo,

        usuario_id: user?.usuario_id || 1, // 🔒 Usando o ID do usuário autenticado


        localizacao_origem_id,
        localizacao_destino_id,
        itens_movimentacao: itensAgrupados,
      };

      console.log('✅ Payload final a ser enviado:', JSON.stringify(payload, null, 2));

      const resposta = await enviarMovimentacao(payload);

      if (eanLocalizacaoAberta) {
        try {
          console.log('[SALVAR] Fechando localização EAN:', eanLocalizacaoAberta);
          await fecharLocalizacao(eanLocalizacaoAberta);
          setEanLocalizacaoAberta('');
          console.log('[SALVAR] Localização fechada após salvar movimentação');
        } catch (err) {
          console.log('[ERRO][SALVAR] Erro ao fechar localização após salvar:', err);
          Alert.alert('Atenção', 'A movimentação foi salva, mas houve erro ao fechar a localização.');
        }
      } else {
        console.log('[SALVAR] Nenhuma localização aberta para fechar.');
      }

      console.log('✅ Movimentação salva com sucesso:', resposta);
      Alert.alert(
        '✅ Sucesso',
        `A movimentação de ${tipo === 'entrada' ? 'entrada' : 'saída'} foi registrada corretamente.`,
        [{ text: 'OK' }]
      );
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
    setEanLocalizacaoAberta('');
    setEanProduto('');
    setTipoBloqueado(false);
    requestAnimationFrame(() => localizacaoRef.current?.focus());
  };

  const onCancelarMovimentacao = async () => {
    setMostrarCancelar(false);
    try {
      if (eanLocalizacaoAberta) {
        console.log('[CANCELAR] Fechando localização EAN:', eanLocalizacaoAberta);
        await fecharLocalizacao(eanLocalizacaoAberta);
        setEanLocalizacaoAberta('');
        console.log('[CANCELAR] Localização fechada ao cancelar movimentação');
      } else {
        console.log('[CANCELAR] Nenhuma localização aberta para fechar.');
      }
    } catch (err) {
      console.log('[ERRO][CANCELAR] Erro ao fechar localização ao cancelar:', err);
      Alert.alert('Erro ao fechar localização', err?.message || 'Tente novamente');
    }
    limparTudo();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
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
          onCancelar={onCancelarMovimentacao}
          tipo="movimentação"
        />

        <ModalExcluirProduto
          visible={mostrarModalExcluir}
          onConfirmar={confirmarExclusao}
          onClose={() => setMostrarModalExcluir(false)}
        />
      </View>
    </SafeAreaView>
  );
}

const screenHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  resumoSKUs: {
    marginTop: 8,
    marginBottom: 6,
    alignItems: 'flex-end',
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  totalTexto: {
    fontWeight: '600',
    fontSize: 15,
    color: '#495057',
  },
  listaContainer: {
    flex: 0.9,
    borderTopWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginTop: 4,
  },
});
