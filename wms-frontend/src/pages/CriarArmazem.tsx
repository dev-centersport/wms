import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Divider,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { criarArmazem as criarArmazemAPI } from '../services/API';
import armazem from '../img/armazem.png';
import Layout from '../components/Layout';


interface Estado {
  id: number;
  nome: string;
  sigla: string;
}

const CriarArmazem: React.FC = () => {
  const navigate = useNavigate();

  const [estados, setEstados] = useState<Estado[]>([]);
  const [cidades, setCidades] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    estado: '',
    cidade: '',
    largura: '',
    altura: '',
    comprimento: '',
  });

  // Carrega estados do IBGE
  useEffect(() => {
    const carregarEstados = async () => {
      try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
        const data = await response.json();
        const ordenados = data.sort((a: Estado, b: Estado) => a.nome.localeCompare(b.nome));
        setEstados(ordenados);
      } catch (error) {
        console.error('Erro ao carregar estados:', error);
      }
    };
    carregarEstados();
  }, []);

  // Carrega cidades do estado selecionado
  useEffect(() => {
    if (formData.estado) {
      const carregarCidades = async () => {
        try {
          const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.estado}/municipios`);
          const data = await response.json();
          const nomes = data.map((cidade: any) => cidade.nome);
          setCidades(nomes);
        } catch (error) {
          console.error('Erro ao carregar cidades:', error);
        }
      };
      carregarCidades();
    } else {
      setCidades([]);
    }
  }, [formData.estado]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'estado' ? { cidade: '' } : {}), // limpa cidade ao trocar estado
    }));
  };
  const handleSalvar = async () => {
    if (!validarCampos()) return;

    try {
      await criarArmazemAPI({
        nome: formData.nome,
        endereco: formData.endereco,
        estado: formData.estado,
        cidade: formData.cidade,
        largura: Number(formData.largura) || undefined,
        altura: Number(formData.altura) || undefined,
        comprimento: Number(formData.comprimento) || undefined,
      });

      alert('Armazém criado com sucesso!');
      navigate('/armazem');
    } catch (err: any) {
      alert(err.message ?? 'Erro ao criar armazém.');
    }
  };



  const validarCampos = (): boolean => {
    if (!formData.nome || !formData.endereco || !formData.estado || !formData.cidade) {
      alert('Preencha todos os campos obrigatórios.');
      return false;
    }
    return true;
  };

  return (
    <Layout>
      <Container>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Criar Armazém
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
              select
              label="Estado"
              fullWidth
              value={formData.estado}
              onChange={(e) => handleChange('estado', e.target.value)}
            >
              {estados.map((estado) => (
                <MenuItem key={estado.id} value={estado.sigla}>
                  {estado.nome} ({estado.sigla})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Cidade"
              fullWidth
              value={formData.cidade}
              onChange={(e) => handleChange('cidade', e.target.value)}
              disabled={!formData.estado}
            >
              {cidades.length > 0 ? (
                cidades.map((cidade, index) => (
                  <MenuItem key={index} value={cidade}>
                    {cidade}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Nenhuma cidade encontrada</MenuItem>
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
                  placeholder='0'
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
                    endAdornment: <span>m</span>,
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

export default CriarArmazem;
