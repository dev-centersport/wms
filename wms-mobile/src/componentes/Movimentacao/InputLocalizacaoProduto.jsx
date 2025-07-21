import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

export default function InputLocalizacaoProduto({
    localizacaoRef,
    produtoRef,
    localizacao_id,
    nomeLocalizacao,
    eanLocalizacao,
    setEanLocalizacao,
    eanProduto,
    setEanProduto,
    handleBuscarLocalizacao,
    handleAdicionarProduto,
    produtos
}) {
    const limpar = (valor) => valor.replace(/[\n\r\t\s]/g, '').trim();

    return (
        <View>
            {!localizacao_id && (
                <TextInput
                    ref={localizacaoRef}
                    value={eanLocalizacao}
                    onChangeText={(v) => setEanLocalizacao(limpar(v))}
                    onSubmitEditing={() => {handleBuscarLocalizacao}}
                    placeholder="Bipe a Localização"
                    style={styles.input}
                    keyboardType="default"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    returnKeyType="done"
                    blurOnSubmit={false}
                    showSoftInputOnFocus={false}
                    maxLength={13}
                />
            )}

            {nomeLocalizacao !== '' && (
                <Text style={styles.localizacaoInfo}>{nomeLocalizacao}</Text>
            )}

            {localizacao_id && (
                <TextInput
                    ref={produtoRef}
                    value={eanProduto}
                    onChangeText={(v) => setEanProduto(limpar(v))}
                    onSubmitEditing={handleAdicionarProduto}
                    placeholder="Bipe o Produto"
                    style={styles.input}
                    keyboardType="default"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    returnKeyType="done"
                    blurOnSubmit={false}
                    showSoftInputOnFocus={false}
                    maxLength={13}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        fontSize: 16,
        marginVertical: 6,
    },
    localizacaoInfo: {
        fontWeight: 'bold',
        color: '#4CAF50',
        backgroundColor: '#eee',
        padding: 6,
        borderRadius: 4,
        marginBottom: 6,
    },
    totalSKU: {
        textAlign: 'right',
        marginTop: 10,
        fontWeight: 'bold',
        color: '#555',
    },
});
