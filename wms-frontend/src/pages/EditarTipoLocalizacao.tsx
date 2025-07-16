// src/pages/EditarTipoLocalizacao.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import {
  buscarTipoLocalizacao,
  atualizarTipoLocalizacao,
} from '../services/API';
import Layout from '../components/Layout';

const EditarTipoLocalizacao: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tipo, setTipo] = useState('');

  useEffect(() => {
    const carregar = async () => {
      try {
        if (!id) {
          alert('ID inválido.');
          navigate('/tipo-localizacao');
          return;
        }

        const dados = await buscarTipoLocalizacao(Number(id));
        setTipo(dados.tipo ?? '');
      } catch (err) {
        alert('Erro ao carregar tipo de localização.');
        navigate('/tipo-localizacao');
      }
    };

    carregar();
  }, [id, navigate]);

  const handleSalvar = async () => {
    try {
      await atualizarTipoLocalizacao(Number(id), { tipo });
      alert('Tipo de localização atualizado com sucesso!');
      navigate('/tipo-localizacao');
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar tipo de localização.');
    }
  };

  return (
    <Layout>
      <Container>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            Editar Localização
        </Typography>

        <TextField
          label="Tipo"
          fullWidth
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          sx={{ mb: 3 }}
        />

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
            onClick={() => navigate('/tipo-localizacao')}
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

export default EditarTipoLocalizacao;

// Necessário para evitar erro TS1208 em projetos com isolatedModules
export {};
