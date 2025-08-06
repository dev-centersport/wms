import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export function TableHeader() {
    return (
        <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { flex: 2 }]}>SKU</Text>
            <Text style={[styles.headerCell, { flex: 3 }]}>Localização</Text>
            <Text style={[styles.headerCell, { flex: 1 }]}>Qtd</Text>
        </View>
    );
}

export function TableBody({ data }) {
    return (
        <FlatList
            data={data}
            keyExtractor={(item, index) => `${item.sku}-${index}`}
            renderItem={({ item }) => (
                <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{item.sku}</Text>
                    <View style={[styles.tableCell, { flex: 3, marginRight: 20 }]}>
                        <Text style={styles.localizacaoText}>
                            {item.localizacao} - {item.armazem}
                        </Text>
                    </View>
                    <Text style={[styles.tableCell, { flex: 1, marginLeft: 10 }]}>
                        {item.quantidade}
                    </Text>
                </View>
            )}
            style={{ flex: 1 }}
        />
    );
}


const styles = StyleSheet.create({
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8f9fa',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderColor: '#dee2e6',
        marginHorizontal: 16,
        marginTop: 8,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    tableRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: '#f1f3f4',
        backgroundColor: '#ffffff',
        marginHorizontal: 16,
    },
    tableCell: {
        fontSize: 14,
        color: '#495057',
        fontWeight: '500',
    },
    localizacaoText: {
        fontSize: 14,
        color: '#212529',
        fontWeight: '600',
    },
    eanLocalizacaoText: {
        fontSize: 12,
        color: '#6c757d',
        fontStyle: 'italic',
        marginTop: 2,
    },
    headerCell: {
        fontSize: 13,
        color: '#495057',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
