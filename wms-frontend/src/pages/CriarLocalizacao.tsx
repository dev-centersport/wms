import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    axios.get('http://151.243.0.78:3001/tipo-localizacao').then(res => setTipos(res.data));
    axios.get('http://151.243.0.78:3001/armazem').then(res => setArmazens(res.data));
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSalvar = () => {
    axios
      .post('http://151.243.0.78:3001/localizacao', {
        nome: formData.nome,
        tipoLocalizacaoId: formData.tipoId,
        armazemId: formData.armazemId,
        largura: parseFloat(formData.largura),
        altura: parseFloat(formData.altura),
        comprimento: parseFloat(formData.comprimento),
      })
      .then(() => {
        alert('Localização criada com sucesso!');
        navigate('/localizacao');
      })
      .catch(() => alert('Erro ao salvar localização'));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, pb: 10 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Nova Localização
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Box display="flex" gap={3} mb={2}>
          <Typography variant="subtitle1" fontWeight="bold">
            Dados Gerais
          </Typography>
          <Typography variant="subtitle1" color="text.disabled">
            Guia
          </Typography>
          <Typography variant="subtitle1" color="text.disabled">
            Guia
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Nome Localização"
            fullWidth
            value={formData.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
          />

          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              select
              label="Tipo"
              fullWidth
              sx={{ flex: 1 }}
              value={formData.tipoId}
              onChange={(e) => handleChange('tipoId', e.target.value)}
            >
              {tipos.map((tipo) => (
                <MenuItem key={tipo.id} value={tipo.id}>
                  {tipo.tipo}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Armazém"
              fullWidth
              sx={{ flex: 1 }}
              value={formData.armazemId}
              onChange={(e) => handleChange('armazemId', e.target.value)}
            >
              {armazens.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.nome}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>

        <Typography variant="subtitle1" mt={4} mb={2} fontWeight="bold">
          Dimensões
        </Typography>

        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            label="Largura"
            type="number"
            fullWidth
            InputProps={{ endAdornment: <span>cm</span> }}
            value={formData.largura}
            onChange={(e) => handleChange('largura', e.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Altura"
            type="number"
            fullWidth
            InputProps={{ endAdornment: <span>cm</span> }}
            value={formData.altura}
            onChange={(e) => handleChange('altura', e.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Comprimento"
            type="number"
            fullWidth
            InputProps={{ endAdornment: <span>cm</span> }}
            value={formData.comprimento}
            onChange={(e) => handleChange('comprimento', e.target.value)}
            sx={{ flex: 1 }}
          />
        </Box>

        <Box display="flex" justifyContent="center" mt={3}>
          <img src="/dimensao.png" alt="Dimensão" style={{ width: 100 }} />
        </Box>
      </Paper>

      {/* Botões Fixos */}
      <Box
        sx={{
          position: 'fixed',
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
