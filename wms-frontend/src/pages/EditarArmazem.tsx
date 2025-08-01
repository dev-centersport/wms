// src/pages/EditarArmazem.tsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Container, TextField, Typography, Divider
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { buscarArmazem, atualizarArmazem } from '../services/API';
import armazem from '../img/armazem.png';
import Layout from '../components/Layout';

const EditarArmazem: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    cidade: '',
    estado: '',
    largura: '',
    altura: '',
    comprimento: '',
  });

  useEffect(() => {
    const carregarArmazem = async () => {
      try {
        const dados = await buscarArmazem();
        const armazem = dados.find((a) => a.armazem_id === Number(id));
        if (armazem) {
          setFormData({
            nome: armazem.nome,
            endereco: armazem.endereco,
            cidade: armazem.cidade ?? '',
            estado: armazem.estado ?? '',
            largura: armazem.largura?.toString() ?? '',
            altura: armazem.altura?.toString() ?? '',
            comprimento: armazem.comprimento?.toString() ?? '',
          });
        } else {
          alert('Armazém não encontrado.');
          navigate('/armazem');
        }
      } catch (err) {
        alert('Erro ao carregar armazém.');
      }
    };
    carregarArmazem();
  }, [id, navigate]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSalvar = async () => {
    try {
      await atualizarArmazem(Number(id), {
        nome: formData.nome,
        endereco: formData.endereco,
        largura: Number(formData.largura) || 0,
        altura: Number(formData.altura) || 0,
        comprimento: Number(formData.comprimento) || 0,
      });
      alert('Armazém atualizado com sucesso!');
      navigate('/armazem');
    } catch (err: any) {
      alert(err.message ?? 'Erro ao atualizar armazém.');
    }
  };

  return (
    <Layout show={false}>
      <Container>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            Editar Armazém
        </Typography>

        <Box display="flex" flexDirection="column" gap={2} alignItems="flex-start">
          <TextField
            label="Nome Armazém"
            fullWidth
            value={formData.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
          />

          <TextField
            label="Endereço"
            fullWidth
            value={formData.endereco}
            onChange={(e) => handleChange('endereco', e.target.value)}
          />

          <Box display="flex" gap={2} width="100%">
            <TextField
              label="Estado"
              fullWidth
              value={formData.estado}
              disabled
            />
            <TextField
              label="Cidade"
              fullWidth
              value={formData.cidade}
              disabled
            />
          </Box>

          <Typography variant="subtitle1" mt={4} mb={2} fontWeight="bold">
            Dimensões
          </Typography>

          <Box display="flex" alignItems="center" gap={3}>
            <Box display="flex" gap={2}>
              {['largura', 'altura', 'comprimento'].map((field, idx) => (
                <TextField
                  key={field}
                  label={field.charAt(0).toUpperCase() + field.slice(1)}
                  type="number"
                  value={(formData as any)[field]}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (/^[0-9]*\.?[0-9]*$/.test(valor)) {
                      handleChange(field, valor);
                    }
                  }}
                  inputProps={{
                    min: 0,
                    step: 'any',
                    inputMode: 'decimal',
                  }}
                  InputProps={{
                    endAdornment: <span>cm</span>,
                  }}
                  sx={{
                    width: 130 + (idx === 2 ? 40 : 0),
                    '& input[type=number]': {
                      MozAppearance: 'textfield',
                    },
                    '& input[type=number]::-webkit-outer-spin-button': {
                      WebkitAppearance: 'none',
                      margin: 0,
                    },
                    '& input[type=number]::-webkit-inner-spin-button': {
                      WebkitAppearance: 'none',
                      margin: 0,
                    },
                  }}
                />
              ))}
            </Box>
            <Box display="flex" alignItems="center" justifyContent="flex-start">
            <img src={armazem} alt="Armazém" style={{ width: 90, height: 'auto', marginBottom: 20, marginLeft: 10 }} />
            </Box>
          </Box>
        </Box>

        <Divider sx={{ mt: 20, mb: 3 }} />

        <Box
           sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
        }}
        >
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
            onClick={() => navigate('/armazem')}
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

export default EditarArmazem;
