import React, { useState } from 'react';
import {
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import Layout from '../components/Layout';

export default function Ocorrencia() {
  const [localizacao, setLocalizacao] = useState('');
  const [skuEan, setSkuEan] = useState('');
  const [quantidade, setQuantidade] = useState<number | ''>('');
  const [observacao, setObservacao] = useState('');

  const handleSalvar = () => {
    // Aqui você pode montar o payload para envio à API
    console.log({
      localizacao,
      skuEan,
      quantidade,
      observacao,
    });

    alert('Ocorrência salva com sucesso!');
    // Resetar campos se quiser
    setLocalizacao('');
    setSkuEan('');
    setQuantidade('');
    setObservacao('');
  };

  return (
    <Layout>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Nova Ocorrência
      </Typography>

      <Box display="flex" flexDirection="column" gap={3} maxWidth={600}>
        {/* Localização */}
        <TextField
          label="Localização do Produto"
          variant="outlined"
          fullWidth
          value={localizacao}
          onChange={(e) => setLocalizacao(e.target.value)}
        />

        {/* SKU / EAN */}
        <TextField
          label="SKU / EAN"
          variant="outlined"
          fullWidth
          value={skuEan}
          onChange={(e) => setSkuEan(e.target.value)}
        />

        {/* Quantidade */}
        <TextField
          label="Quantidade"
          type="number"
          variant="outlined"
          fullWidth
          value={quantidade}
          onChange={(e) => setQuantidade(Number(e.target.value))}
        />

        {/* Observação */}
        <TextField
          label="Observação"
          multiline
          minRows={4}
          fullWidth
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />
      </Box>

      {/* Ações */}
      <Box display="flex" gap={2} mt={4}>
        <Button
          variant="contained"
          color="success"
          startIcon={<Save />}
          onClick={handleSalvar}
        >
          Salvar
        </Button>

        <Button variant="contained" color="inherit" startIcon={<Cancel />}>
          Cancelar
        </Button>
      </Box>
    </Layout>
  );
}
