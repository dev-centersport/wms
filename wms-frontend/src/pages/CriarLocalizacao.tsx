import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  MenuItem,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import prateleira from '../img/7102305.png';


interface Tipo {
  id: number;
  tipo: string;
}

interface Armazem {
  id: number;
  nome: string;
}

const CriarLocalizacao: React.FC = () => {
  const navigate = useNavigate();

  const [tipos, setTipos] = useState<Tipo[]>([]);
  const [armazens, setArmazens] = useState<Armazem[]>([]);

  const [formData, setFormData] = useState({
    nome: '',
    tipoId: '',
    armazemId: '',
    largura: '',
    altura: '',
    comprimento: '',
  });

  useEffect(() => {
    axios
      .get('http://151.243.0.78:3001/tipo-localizacao')
      .then((res) => {
        const adaptado = res.data.map((t: any) => ({
          id: t.tipo_localizacao_id ?? t.id,
          tipo: t.tipo,
        }));
        setTipos(adaptado);
      })
      .catch(() => alert('Erro ao carregar tipos'));

    axios
      .get('http://151.243.0.78:3001/armazem')
      .then((res) => {
        const adaptado = res.data.map((a: any) => ({
          id: a.armazem_id ?? a.id,
          nome: a.nome,
        }));
        setArmazens(adaptado);
      })
      .catch(() => alert('Erro ao carregar armazéns'));
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSalvar = () => {
    axios
      .post('http://151.243.0.78:3001/localizacao', {
        nome: formData.nome,
        tipoLocalizacaoId: Number(formData.tipoId),
        armazemId: Number(formData.armazemId),
        largura: Number(formData.largura) || 0,
        altura: Number(formData.altura) || 0,
        comprimento: Number(formData.comprimento) || 0,
      })
      .then(() => {
        alert('Localização criada com sucesso!');
        navigate('/localizacao');
      })
      .catch(() => alert('Erro ao salvar localização'));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, pb: 12, marginRight:80 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Nova Localização
      </Typography>

      <Divider sx={{ mb: 3 }} />

      <Box display="flex" flexDirection="column" gap={2} alignItems="flex-start">
        <TextField
          label="Nome Localização"
          fullWidth
          value={formData.nome}
          onChange={(e) => handleChange('nome', e.target.value)}
        />

        <Box display="flex" gap={2} flexWrap="wrap" width="100%">
          <TextField
            select
            label="Tipo"
            fullWidth
            sx={{ flex: 1 }}
            value={formData.tipoId}
            onChange={(e) => handleChange('tipoId', e.target.value)}
          >
            {tipos.length > 0 ? (
              tipos.map((tipo) => (
                <MenuItem key={tipo.id} value={String(tipo.id)}>
                  {tipo.tipo}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Nenhum tipo encontrado</MenuItem>
            )}
          </TextField>

          <TextField
            select
            label="Armazém"
            fullWidth
            sx={{ flex: 1 }}
            value={formData.armazemId}
            onChange={(e) => handleChange('armazemId', e.target.value)}
          >
            {armazens.length > 0 ? (
              armazens.map((ar) => (
                <MenuItem key={ar.id} value={String(ar.id)}>
                  {ar.nome}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>Nenhum armazém encontrado</MenuItem>
            )}
          </TextField>
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
                  onChange={(e) => handleChange(field, e.target.value)}
                  InputProps={{
                    endAdornment: <span>cm</span>,
                    inputProps: { inputMode: 'numeric', pattern: '[0-9]*' },
                  }}
                  sx={{
                    width: 130 + (idx === 2 ? 40 : 0), // comprimento um pouco maior
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
          <Box display="flex" alignItems="center" justifyContent="flex-start" >
            <img src={prateleira} alt="Medição" style={{ width: 90, height: 'auto' }} />
         </Box>  
        </Box>
      </Box>

      <Divider sx={{ mt: 20, mb: 3 }} />

      <Box
        sx={{
          marginRight:30,
          bottom: 20,
          left: 0,
          right: 0,
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
          onClick={() => navigate('/localizacao')}
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
  );
};

export default CriarLocalizacao;
