import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { criarTipoLocalizacao } from '../services/API';
import Layout from '../components/Layout';

const CriarTipo: React.FC = () => {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState('');

  const validar = (): boolean => {
    if (!tipo.trim()) {
      alert('Informe o nome do tipo de localização.');
      return false;
    }
    return true;
  };

  const handleSalvar = async () => {
    if (!validar()) return;

    try {
      await criarTipoLocalizacao({ tipo });
      alert('Tipo de localização criado com sucesso!');
      navigate('/TipoLocalizacao');
    } catch (err: any) {
      alert(err.message ?? 'Erro ao criar tipo de localização.');
    }
  };

  return (
    <Layout show={false}>
      <Container>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            Criar Localização
        </Typography>

        <TextField
          label="Tipo"
          fullWidth
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Divider sx={{ mt: 20, mb: 3 }} />

        <Box display="flex" justifyContent="center" gap={2}>
          <Button
            variant="contained"
            onClick={handleSalvar}
            sx={{
              backgroundColor: '#59e60d',
              color: '#000',
              fontWeight: 'bold',
              px: 6,
              '&:hover': { backgroundColor: '#48c307' },
            }}
          >
            SALVAR
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => navigate('/TipoLocalizacao')}
            sx={{
              backgroundColor: '#f2f2f2',
              fontWeight: 'bold',
              color: '#333',
              px: 6,
            }}
          >
            CANCELAR
          </Button>
        </Box>
      </Container>
    </Layout>
  );
};

export default CriarTipo;

// evita o erro TS1208 caso isolatedModules esteja ativo
export {};
