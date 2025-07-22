import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import Header from '../componentes/Ocorrencia/Header';
import InputLocalizacao from '../componentes/Ocorrencia/InputLocalizacao';
import InputProduto from '../componentes/Ocorrencia/InputProduto';
import QuantidadeDisplay from '../componentes/Ocorrencia/QuantidadeDisplay';
import BotoesAcoes from '../componentes/Ocorrencia/BotoesAcoes';
import ModalConfirmacao from '../componentes/Ocorrencia/ModalConfirmacao';
import ModalCancelar from '../componentes/Ocorrencia/ModalCancelar';

import {
  buscarLocalizacaoPorEAN,
  buscarProdutoEstoquePorLocalizacaoEAN,
  criarOcorrencia,
} from '../api/ocorrenciaAPI';

export default function Ocorrencia() {
  const [localizacao, setLocalizacao] = useState('');
  const [sku, setSku] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [quantidadeBipada, setQuantidadeBipada] = useState('');
  const [nomeLocalizacao, setNomeLocalizacao] = useState('');
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [mostrarCancelar, setMostrarCancelar] = useState(false);
  const [produtoValidado, setProdutoValidado] = useState(false);

  const [localizacaoBloqueada, setLocalizacaoBloqueada] = useState(false);
  const [skuBloqueado, setSkuBloqueado] = useState(true);

  const navigation = useNavigation();
  const localizacaoRef = useRef(null);
  const skuRef = useRef(null);

  const limparCodigo = (valor) => valor.replace(/[\n\r\t\s]/g, '').trim();

  useEffect(() => {
    if (!localizacaoBloqueada && localizacaoRef.current) {
      requestAnimationFrame(() => localizacaoRef.current.focus());
    }
  }, [localizacaoBloqueada]);

  useEffect(() => {
    if (localizacaoBloqueada && skuRef.current) {
      requestAnimationFrame(() => skuRef.current.focus());
    }
  }, [localizacaoBloqueada]);

  const handleBuscarLocalizacao = async (eanBipado) => {
    const eanLocal = limparCodigo(eanBipado || localizacao);
    if (!eanLocal) return;
    try {
      const res = await buscarLocalizacaoPorEAN(eanLocal);
      setLocalizacao(eanLocal);
      setNomeLocalizacao(`${res.nome} - ${res.armazem}`);
      setLocalizacaoBloqueada(true);
      setSkuBloqueado(false);
    } catch {
      setNomeLocalizacao('');
      Alert.alert('Erro', 'Localização não encontrada.');
    }
  };

  const handleBuscarQuantidade = async (eanBipado) => {
    const eanLocal = limparCodigo(localizacao);
    const eanProduto = limparCodigo(eanBipado || sku);
    try {
      const dados = await buscarProdutoEstoquePorLocalizacaoEAN(eanLocal, eanProduto);
      setSku(eanProduto);
      setQuantidade(String(dados.quantidade));
      setProdutoValidado(true);
      setSkuBloqueado(true);
    } catch (err) {
      setQuantidade('');
      setProdutoValidado(false);
      Alert.alert('Erro', err.message || 'Produto não encontrado nesta localização.');
    }
  };

  const handleQuantidadeBipadaChange = (valor) => {
    const somenteNumeros = valor.replace(/[^0-9]/g, '');
    setQuantidadeBipada(somenteNumeros);
  };

  const handleSalvar = () => {
    if (!localizacaoBloqueada) {
      Alert.alert('Atenção', 'Você precisa validar a localização.');
      return;
    }

    if (!produtoValidado) {
      Alert.alert('Atenção', 'Você precisa validar o SKU/EAN dando Enter após digitar.');
      return;
    }

    if (!quantidadeBipada || isNaN(quantidadeBipada) || Number(quantidadeBipada) <= 0) {
      Alert.alert('Atenção', 'Informe uma quantidade bipada válida (número maior que 0).');
      return;
    }

    setMostrarConfirmacao(true);
  };

  const confirmarSalvar = async () => {
    try {
      const payload = {
        usuario_id: 1,
        localizacao_id: Number(localizacaoBloqueada ? (await buscarLocalizacaoPorEAN(localizacao)).localizacao_id : 0),
        produto_estoque_id: Number((await buscarProdutoEstoquePorLocalizacaoEAN(localizacao, sku)).produto_estoque_id),
        quantidade_bipada: Number(quantidadeBipada),
      };
      await criarOcorrencia(payload);
      Alert.alert('Sucesso', 'Ocorrência registrada com sucesso!');
      limparTudo();
    } catch (err) {
      Alert.alert('Erro', err.message || 'Erro ao registrar ocorrência.');
    } finally {
      setMostrarConfirmacao(false);
    }
  };

  const limparTudo = () => {
    setLocalizacao('');
    setSku('');
    setQuantidade('');
    setQuantidadeBipada('');
    setNomeLocalizacao('');
    setLocalizacaoBloqueada(false);
    setSkuBloqueado(true);
    setProdutoValidado(false);
    requestAnimationFrame(() => localizacaoRef.current?.focus());
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Header
          onClose={() => {
            if (localizacaoBloqueada) {
              Alert.alert('Ocorrência pendente', 'Existe uma ocorrência pendente. Termine ou cancele.');
            } else {
              navigation.navigate('Home');
            }
          }}
        />

        <InputLocalizacao
          refInput={localizacaoRef}
          value={localizacao}
          onChangeText={(v) => setLocalizacao(limparCodigo(v))}
          onSubmitEditing={({ nativeEvent }) => handleBuscarLocalizacao(nativeEvent.text)}
          bloqueado={localizacaoBloqueada}
          nomeLocalizacao={nomeLocalizacao}
        />

        {localizacaoBloqueada && (
          <InputProduto
            refInput={skuRef}
            value={sku}
            onChangeText={(v) => setSku(limparCodigo(v))}
            onSubmitEditing={({ nativeEvent }) => handleBuscarQuantidade(nativeEvent.text)}
            bloqueado={skuBloqueado}
          />
        )}

        <QuantidadeDisplay quantidade={quantidade} />

        {produtoValidado && (
          <>
            <Text style={styles.label}>Quantidade Bipado</Text>
            <TextInput
              style={styles.input}
              value={quantidadeBipada}
              onChangeText={handleQuantidadeBipadaChange}
              placeholder="Digite a quantidade bipada"
              keyboardType="numeric"
              returnKeyType="done"
              blurOnSubmit={true}
            />
          </>
        )}

        <BotoesAcoes onSalvar={handleSalvar} onCancelar={() => setMostrarCancelar(true)} />
      </ScrollView>

      <ModalConfirmacao
        visible={mostrarConfirmacao}
        onClose={() => setMostrarConfirmacao(false)}
        onConfirmar={confirmarSalvar}
        quantidade={quantidade}
      />

      <ModalCancelar
        visible={mostrarCancelar}
        onClose={() => setMostrarCancelar(false)}
        onConfirmar={() => {
          setMostrarCancelar(false);
          limparTudo();
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 100,
    paddingTop: 40,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  label: {
    marginTop: 20,
    marginBottom: 6,
    fontWeight: '600',
    fontSize: 14,
  },
});
