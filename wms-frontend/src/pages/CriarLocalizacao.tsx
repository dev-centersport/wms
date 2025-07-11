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
import { useNavigate } from 'react-router-dom';

import {
  criarLocalizacao as criarLocalizacaoAPI,
  buscarArmazem,
  buscarTiposDeLocalizacao,
  buscarLocalizacoes,
} from '../services/API';

import prateleira from '../img/7102305.png';
import Layout from '../components/Layout';

interface TipoLocalizacao {
  tipo_localizacao_id: number;
  tipo: string;
}

interface Armazem {
  armazem_id: number;
  nome: string;
}

const CriarLocalizacao: React.FC = () => {
  const navigate = useNavigate();

  const [tipos, setTipos] = useState<TipoLocalizacao[]>([]);
  const [armazens, setArmazens] = useState<Armazem[]>([]);
  const [listaLocalizacoes, setListaLocalizacoes] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    armazem: '',
    largura: '',
    altura: '',
    comprimento: '',
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [listaTipos, listaArmazens, localizacoesExistentes] = await Promise.all([
          buscarTiposDeLocalizacao(),
          buscarArmazem(),
          buscarLocalizacoes(),
        ]);

        setTipos(listaTipos);
        setArmazens(listaArmazens);
        setListaLocalizacoes(localizacoesExistentes);
      } catch (err) {
        alert('Erro ao carregar dados iniciais.');
        console.error(err);
      }
    };

    carregarDados();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

    const validarCampos = (): boolean => {
    if (!formData.nome || !formData.tipo) {
      alert('Preencha o nome e selecione o tipo de localização.');
      return false;
    }

    const nomeExisteNoMesmoArmazem = listaLocalizacoes.some(
      (loc) =>
        loc.nome?.trim().toLowerCase() === formData.nome.trim().toLowerCase() &&
        loc.armazem?.trim().toLowerCase() === formData.armazem.trim().toLowerCase()
    );

    if (nomeExisteNoMesmoArmazem) {
      alert('Já existe uma localização com este nome neste armazém. Escolha outro nome ou armazém.');
      return false;
    }

    return true;
  };

  const handleSalvar = async () => {
    if (!validarCampos()) return;

    try {
      await criarLocalizacaoAPI({
        nome: formData.nome,
        status: 'fechada',
        altura: formData.altura === '' ? '0' : String(formData.altura),
        largura: formData.largura === '' ? '0' : String(formData.largura),
        comprimento: formData.comprimento === '' ? '0' : String(formData.comprimento),
        tipo: formData.tipo,
        armazem: formData.armazem,
      });

      alert('Localização criada com sucesso!');
      navigate('/localizacao');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <Container>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Criar Localização
        </Typography>

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
              value={formData.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
            >
              {tipos.length > 0 ? (
                tipos.map((tipo) => (
                  <MenuItem key={tipo.tipo_localizacao_id} value={tipo.tipo}>
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
              value={formData.armazem}
              onChange={(e) => handleChange('armazem', e.target.value)}
            >
              {armazens.length > 0 ? (
                armazens.map((ar) => (
                  <MenuItem key={ar.armazem_id} value={ar.nome}>
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
                  placeholder="0"
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
              <img src={prateleira} alt="Medição" style={{ width: 90, height: 'auto' }} />
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
    </Layout>
  );
};

export default CriarLocalizacao;
