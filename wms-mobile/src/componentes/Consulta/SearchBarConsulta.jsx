import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SearchBarConsulta({ value, onChange }) {
    return (
        <View style={styles.searchContainer}>
            <TextInput
                placeholder="Nome, SKU ou EAN"
                style={styles.searchInput}
                value={value}
                onChangeText={onChange}
                placeholderTextColor="#888"
            />
            <Ionicons name="search" size={20} color="green" style={{ marginLeft: 10 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        flexDirection: 'row',
        marginHorizontal: 16,
        alignItems: 'center',
        backgroundColor: '#eee',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginBottom: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#000',
    },
});
