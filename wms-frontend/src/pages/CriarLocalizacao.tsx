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

// Serviços centralizados de API
import {
  criarLocalizacao as criarLocalizacaoAPI,
  buscarArmazem,
  buscarTiposDeLocalizacao,
} from '../services/API';

import prateleira from '../img/7102305.png';
import Layout from '../components/Layout';

// Tipagens vindas (ou equivalentes) do serviço ---------------------------
interface TipoLocalizacao {
  tipo_localizacao_id: number;
  tipo: string;
}

interface Armazem {
  armazem_id: number;
  nome: string;
}
//--------------------------------------------------------------------------

const CriarLocalizacao: React.FC = () => {
  const navigate = useNavigate();

  const [tipos, setTipos] = useState<TipoLocalizacao[]>([]);
  const [armazens, setArmazens] = useState<Armazem[]>([]);

  const [formData, setFormData] = useState({
    nome: '',
    tipo: '', // agora armazenamos o texto do tipo, não o ID
    armazemId: '', // permanece para UI, mas não é enviado no serviço (o serviço usa o primeiro armazém)
    largura: '',
    altura: '',
    comprimento: '',
  });

  //------------------------------------------------------------------
  // Carregar listas de tipos e armazéns via serviços reutilizáveis
  //------------------------------------------------------------------
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [listaTipos, listaArmazens] = await Promise.all([
          buscarTiposDeLocalizacao(),
          buscarArmazem(),
        ]);

        setTipos(listaTipos);
        setArmazens(listaArmazens);
      } catch (err) {
        alert('Erro ao carregar tipos ou armazéns');
        console.error(err);
      }
    };

    carregarDados();
  }, []);

  //------------------------------------------------------------------
  // Helpers
  //------------------------------------------------------------------
  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validarCampos = (): boolean => {
    if (!formData.nome || !formData.tipo) {
      alert('Preencha o nome e selecione o tipo de localização.');
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
        tipo: formData.tipo,
        altura: formData.altura,
        largura: formData.largura,
        comprimento: formData.comprimento,
      });

      alert('Localização criada com sucesso!');
      navigate('/localizacao');
    } catch (err) {
      console.error(err);
      // a própria API já trata e exibe alerts detalhados
    }
  };

  //------------------------------------------------------------------
  // Render
  //------------------------------------------------------------------
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
            {/* Seleção de Tipo */}
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

            {/* Seleção de Armazém (opcional / informativo) */}
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
                  <MenuItem key={ar.armazem_id} value={String(ar.armazem_id)}>
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
                  onChange={(e) => {
                    const valor = e.target.value;
                    // Bloqueia hífen e caracteres não numéricos (exceto ponto)
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
