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
                    onSubmitEditing={() => handleBuscarLocalizacao()}
                    placeholder="Bipe a Localização"
                    style={styles.input}
                    keyboardType="default"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    returnKeyType="done"
                    blurOnSubmit={false}
                    showSoftInputOnFocus={false}
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
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: '#dee2e6',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        marginVertical: 6,
        backgroundColor: '#ffffff',
        color: '#212529',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    localizacaoInfo: {
        fontWeight: '600',
        color: '#fff',
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 8,
        marginBottom: 6,
        textAlign: 'center',
        fontSize: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    totalSKU: {
        textAlign: 'right',
        marginTop: 12,
        fontWeight: '600',
        color: '#495057',
        fontSize: 15,
    },
});
