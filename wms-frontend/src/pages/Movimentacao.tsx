import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  MenuItem,
  Select,
  TextField,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper
} from '@mui/material';
import Layout from '../components/Layout';

const Movimentacao: React.FC = () => {
  const [tipo, setTipo] = useState('entrada');
  const [localizacao, setLocalizacao] = useState('');
  const [produto, setProduto] = useState('');
  const [lista, setLista] = useState<any[]>([]);

  const handleAdicionarProduto = () => {
    if (!produto) return;
    const novo = {
      contador: 'Cell A',
      descricao: 'Cell B',
      sku: 'Cell C',
      ean: produto,
    };
    setLista((prev) => [...prev, novo]);
    setProduto('');
  };

  return (
    <Layout>
      <Container maxWidth="md">
        <Box mt={3} mb={2}>
          <Typography variant="h5" fontWeight={600}>
            Movimentação de Estoque
          </Typography>
        </Box>

        <Box display="flex" gap={2} alignItems="center" mb={2}>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>
            Tipo
          </Typography>
          <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <MenuItem value="entrada">Entrada</MenuItem>
            <MenuItem value="saida">Saída</MenuItem>
            <MenuItem value="transferencia">Transferência</MenuItem>
          </Select>
        </Box>

        <Box mb={2}>
          <TextField
            fullWidth
            label="Bipe a Localização"
            value={localizacao}
            onChange={(e) => setLocalizacao(e.target.value)}
          />
        </Box>

        <Box mb={2}>
          <TextField
            fullWidth
            label="Bipe o Produto"
            value={produto}
            onChange={(e) => setProduto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdicionarProduto()}
          />
        </Box>

        <Paper sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Contador</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>EAN</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lista.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.contador}</TableCell>
                  <TableCell>{item.descricao}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.ean}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Box display="flex" justifyContent="center" gap={2}>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#61de27', color: '#000', fontWeight: 'bold' }}
          >
            Salvar
          </Button>
          <Button variant="outlined">Cancelar</Button>
        </Box>
      </Container>
    </Layout>
  );
};

export default Movimentacao;