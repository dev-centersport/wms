import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register fonts with proper URLs
Font.register({
  family: 'Roboto',
  fonts: [
    { 
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff2',
      fontWeight: 400
    },
    { 
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4.woff2',
      fontWeight: 700
    }
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
    fontWeight: 700, 
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
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: '#eaeaea',
    fontWeight: 700
  },
  tableCol: { 
    width: "25%", 
    borderRightWidth: 1, 
    borderColor: '#c2c2c2', 
    padding: 5 
  },
  tableColLast: {
    width: "25%",
    borderRightWidth: 0,
    borderColor: '#c2c2c2',
    padding: 5
  },
  small: { 
    fontSize: 9, 
    color: "#888" 
  },
  locationHeader: {
    marginBottom: 5, 
    fontWeight: 700
  },
  produtosNaoEncontrados: {
    marginTop: 16
  },
  errorText: {
    fontWeight: 700, 
    color: '#d32f2f'
  },
  productImage: {
    width: 40,
    height: 40,
    marginBottom: 4
  }
});

// Interfaces atualizadas
interface InfoArmazem {
  armazemID: number;
  armazem: string;
}

interface PedidoAtendido {
  pedidoId: string;
  numeroPedido: string;
}

interface LocalizacaoAgrupada {
  armazem: InfoArmazem[];
  localizacao: string;
  produtoSKU: string;
  quantidadeSeparada: number;
  pedidosAtendidos: PedidoAtendido[];
}

interface PdfPorLocalizacaoProps {
  data: {
    localizacoes: LocalizacaoAgrupada[];
    produtosNaoEncontrados?: string[];
  };
}

const PdfPorLocalizacao: React.FC<PdfPorLocalizacaoProps> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>Impressão por Localização</Text>
      {data.localizacoes.map((loc) => (
        <View key={`${loc.localizacao}-${loc.produtoSKU}`} wrap={false}>
          <Text style={styles.locationHeader}>
            Localização: {loc.localizacao} | SKU: {loc.produtoSKU} | Qtd: {loc.quantidadeSeparada}
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={styles.tableCol}>Armazém(s)</Text>
              <Text style={styles.tableCol}>Pedidos Atendidos</Text>
              <Text style={styles.tableCol}>Quantidade</Text>
              <Text style={styles.tableColLast}>Anotações</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCol}>
                {loc.armazem.map(a => a.armazem).join(', ')}
              </Text>
              <Text style={styles.tableCol}>
                {loc.pedidosAtendidos.map(p => `#${p.numeroPedido}`).join(', ')}
              </Text>
              <Text style={styles.tableCol}>{loc.quantidadeSeparada}</Text>
              <Text style={styles.tableColLast}>▢</Text>
            </View>
          </View>
        </View>
      ))}
      {data.produtosNaoEncontrados && data.produtosNaoEncontrados.length > 0 && (
        <View style={styles.produtosNaoEncontrados}>
          <Text style={styles.errorText}>Produtos não encontrados:</Text>
          {data.produtosNaoEncontrados.map((sku) => (
            <Text style={styles.small} key={sku}>{sku}</Text>
          ))}
        </View>
      )}
    </Page>
  </Document>
);

export default PdfPorLocalizacao;