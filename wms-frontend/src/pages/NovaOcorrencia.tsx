import React, { useState} from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  Container,
  Divider,
} from '@mui/material';
import { Save, Cancel } from '@mui/icons-material';
import Layout from '../components/Layout';
import {
  criarOcorrencia,
  buscarProdutoEstoquePorLocalizacaoEAN,
} from '../services/API';
import SearchIcon from '@mui/icons-material/Search';
import { Navigate, useNavigate } from 'react-router-dom';

export default function Ocorrencia() {
  const [localizacao, setLocalizacao] = useState('');
  const [skuEan, setSkuEan] = useState('');
  const [quantidade, setQuantidade] = useState<number | ''>('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  // Busca automática da quantidade após bipar localização + produto
  const handleBuscarQuantidade = async () => {
    if (!localizacao || !skuEan) return;

    try {
      const resultado = await buscarProdutoEstoquePorLocalizacaoEAN(
        localizacao.trim(),
        skuEan.trim()
      );

      if (!resultado || !resultado.produto_estoque_id || !resultado.localizacao_id) {
        alert('Produto não encontrado nesta localização.');
        return;
      }

      setQuantidade(resultado.quantidade || 0);
    } catch (err: any) {
      console.error('Erro ao buscar quantidade:', err);
      alert('Erro ao buscar quantidade.');
    }
  };

  // Envia a ocorrência + auditoria
  const handleSalvar = async () => {
    if (!localizacao || !skuEan || quantidade === '') {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setCarregando(true);

      const resultado = await buscarProdutoEstoquePorLocalizacaoEAN(
        localizacao.trim(),
        skuEan.trim()
      );

      if (!resultado || !resultado.produto_estoque_id || !resultado.localizacao_id) {
        alert('Produto não encontrado nesta localização.');
        return;
      }

      const payload = {
        usuario_id: 1, // ← fixo por enquanto
        produto_estoque_id: resultado.produto_estoque_id,
        localizacao_id: resultado.localizacao_id,
        quantidade: Number(quantidade),
      };

      await criarOcorrencia(payload);

      alert('Ocorrência registrada com sucesso.');

      // Limpa os campos
      setLocalizacao('');
      setSkuEan('');
    //   setQuantidade('');
    } catch (err: any) {
      alert(`Erro ao salvar: ${err?.response?.data?.message || err.message}`);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Layout show={false}>
      <Container>
        <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
          Nova Ocorrência
        </Typography>

        <Box display="flex" flexDirection="column" gap={3} width="100%">
          <TextField
            label="EAN da Localização"
            variant="outlined"
            fullWidth
            value={localizacao}
            onChange={(e) => setLocalizacao(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBuscarQuantidade()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="EAN do Produto"
            variant="outlined"
            fullWidth
            value={skuEan}
            onChange={(e) => setSkuEan(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBuscarQuantidade()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Quantidade"
            type="number"
            variant="outlined"
            fullWidth
            value={quantidade}
            InputProps={{ readOnly: true }}
          />
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
            color="success"
            onClick={handleSalvar}
            disabled={carregando}
            sx={{
              backgroundColor: '#59e60d',
              color: '#000',
              fontWeight: 'bold',
              px: 6,
              '&:hover': { backgroundColor: '#48c307' },
            }}
          >
            {carregando ? 'SALVANDO...' : 'SALVAR'}
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate('/Ocorrencias')}
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
}
