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
import prateleira from "../img/7102305.png"
import { buscarArmazem } from '../services/API';

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
    <Container maxWidth="md" sx={{ mt: 2, marginRight: 40  }}>
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
            <TextField
              label="Largura"
              type="number"
              InputProps={{ endAdornment: <span>cm</span> }}
              value={formData.largura}
              onChange={(e) => handleChange('largura', e.target.value)}
              sx={{ width: 130 }}
            />
            <TextField
              label="Altura"
              type="number"
              InputProps={{ endAdornment: <span>cm</span> }}
              value={formData.altura}
              onChange={(e) => handleChange('altura', e.target.value)}
              sx={{ width: 130 }}
            />
            <TextField
              label="Comprimento"
              type="number"
              InputProps={{ endAdornment: <span>cm</span> }}
              value={formData.comprimento}
              onChange={(e) => handleChange('comprimento', e.target.value)}
              sx={{ width: 170 }}
            />
          </Box>
          <Box display="flex" alignItems="center" justifyContent="flex-start" >
            <img src={prateleira} alt="Medição" style={{ width: 90, height: 'auto' }} />
         </Box> 

        </Box>
      </Box>  
      <Divider sx={{ mt: 43, mb: 3 }} />

      <Box
        sx={{
          position: 'fixed',
          bottom: 80,
          left: 0,
          right: 400,
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