import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf' },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc-.ttf', fontWeight: 700 }
  ]
});

const styles = StyleSheet.create({
  page: { 
    padding: 24, 
    fontFamily: 'Roboto', 
    fontSize: 11 
  },
  title: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 8 
  },
  table: { 
    width: "100%", 
    marginVertical: 12, 
    borderStyle: "solid", 
    borderWidth: 1, 
    borderColor: '#c2c2c2' 
  },
  tableRow: { 
    flexDirection: "row" 
  },
  tableHeader: { 
    backgroundColor: '#eaeaea', 
    fontWeight: "bold" 
  },
  tableCol: { 
    width: "20%", 
    borderRightWidth: 1, 
    borderColor: '#c2c2c2', 
    padding: 5 
  },
  lastCol: { 
    borderRightWidth: 0 
  },
  small: { 
    fontSize: 9, 
    color: "#888" 
  },
  produtosNaoEncontrados: {
    marginTop: 16
  },
  errorText: {
    fontWeight: 'bold', 
    color: '#d32f2f'
  }
});

type Props = {
  data: {
    localizacoes: {
      armazem: { armazemID: number; armazem: string }[];
      localizacao: string;
      produtoSKU: string;
      quantidadeSeparada: number;
      pedidosAtendidos: { pedidoId: string; numeroPedido: string }[];
    }[];
    produtosNaoEncontrados?: string[];
  };
};

const PdfPorLocalizacao: React.FC<Props> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Impressão por Localização</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCol}>Armazém</Text>
          <Text style={styles.tableCol}>Localização</Text>
          <Text style={styles.tableCol}>SKU</Text>
          <Text style={styles.tableCol}>Qtd Separada</Text>
          <Text style={[styles.tableCol, styles.lastCol]}>Pedidos Atendidos</Text>
        </View>
        {data.localizacoes.map((loc) => (
          <View style={styles.tableRow} key={`${loc.localizacao}-${loc.produtoSKU}`}>
            <Text style={styles.tableCol}>{loc.armazem?.map(a => a.armazem).join(', ')}</Text>
            <Text style={styles.tableCol}>{loc.localizacao}</Text>
            <Text style={styles.tableCol}>{loc.produtoSKU}</Text>
            <Text style={styles.tableCol}>{loc.quantidadeSeparada}</Text>
            <Text style={[styles.tableCol, styles.lastCol]}>
              {loc.pedidosAtendidos.map(pa => pa.numeroPedido).join(', ')}
            </Text>
          </View>
        ))}
      </View>
      {data.produtosNaoEncontrados && data.produtosNaoEncontrados.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontWeight: 'bold', color: '#d32f2f' }}>Produtos não encontrados:</Text>
          {data.produtosNaoEncontrados.map((sku, idx) => (
            <Text style={styles.small} key={sku}>{sku}</Text>
          ))}
        </View>
      )}
    </Page>
  </Document>
);

export default PdfPorLocalizacao;