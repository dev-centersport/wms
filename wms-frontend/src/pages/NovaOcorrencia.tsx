import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  Container,
  Divider,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import Layout from '../components/Layout';
import {
  criarOcorrencia,
  buscarProdutoEstoquePorLocalizacaoEAN,
  buscarLocalizacaoPorEAN,
} from '../services/API';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

export default function Ocorrencia() {
  const [eanLocalizacao, setEanLocalizacao] = useState('');
  const [nomeLocalizacao, setNomeLocalizacao] = useState('');
  const [localizacaoID, setLocalizacaoID] = useState<number | null>(null);

  const [skuEan, setSkuEan] = useState('');
  const [produtoEstoqueID, setProdutoEstoqueID] = useState<number | null>(null);
  const [quantidadeSistema, setQuantidadeSistema] = useState<number | ''>('');
  const [quantidadeEsperada, setQuantidadeEsperada] = useState<number | ''>('');

  const [carregando, setCarregando] = useState(false);

  const navigate = useNavigate();

  const limparCodigo = (valor: string) => valor.replace(/[\n\r\t\s]/g, '').trim();

  const handleBuscarLocalizacao = async () => {
    const ean = limparCodigo(eanLocalizacao);
    if (!ean) return;

    try {
      const res = await buscarLocalizacaoPorEAN(ean);
      setNomeLocalizacao(`${res.armazem} - ${res.nome}`);
      setLocalizacaoID(res.localizacao_id);
    } catch {
      alert('Localização não encontrada.');
      setNomeLocalizacao('');
      setLocalizacaoID(null);
    }
  };

  const handleBuscarProduto = async () => {
    const eanLocal = limparCodigo(eanLocalizacao);
    const eanProduto = limparCodigo(skuEan);

    try {
      const res = await buscarProdutoEstoquePorLocalizacaoEAN(eanLocal, eanProduto);
      setProdutoEstoqueID(res.produto_estoque_id);
      setQuantidadeSistema(res.quantidade || 0);
    } catch (err: any) {
      alert(err?.message || 'Produto não encontrado nesta localização.');
      setProdutoEstoqueID(null);
      setQuantidadeSistema('');
    }
  };

  const handleSalvar = async () => {
    if (!localizacaoID || !produtoEstoqueID || quantidadeEsperada === '') {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setCarregando(true);

      const payload = {
        usuario_id: 1,
        produto_estoque_id: produtoEstoqueID,
        localizacao_id: localizacaoID,
        quantidade_esperada: Number(quantidadeEsperada),
      };

      await criarOcorrencia(payload);

      alert('Ocorrência registrada com sucesso.');

      // Limpa tudo
      setEanLocalizacao('');
      setNomeLocalizacao('');
      setLocalizacaoID(null);
      setSkuEan('');
      setProdutoEstoqueID(null);
      setQuantidadeSistema('');
      setQuantidadeEsperada('');
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
            value={nomeLocalizacao || eanLocalizacao}
            onChange={(e) => setEanLocalizacao(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBuscarLocalizacao()}
            InputProps={{
              readOnly: !!nomeLocalizacao,
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
            onKeyDown={(e) => e.key === 'Enter' && handleBuscarProduto()}
            InputProps={{
              readOnly: !!produtoEstoqueID,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Quantidade no Sistema"
            type="number"
            variant="outlined"
            fullWidth
            value={quantidadeSistema}
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="Quantidade Encontrada na Gaveta"
            type="number"
            variant="outlined"
            fullWidth
            value={quantidadeEsperada}
            onChange={(e) => setQuantidadeEsperada(Number(e.target.value))}
          />
        </Box>

        <Divider sx={{ mt: 10, mb: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
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
