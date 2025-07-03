import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { criarLocalizacao } from '../services/API';

const TelaTeste: React.FC = () => {
  const [localizacao, setLocalizacao] = useState('');
  const [tipo, setTipo] = useState('');
  const [altura, setAltura] = useState('');
  const [largura, setLargura] = useState('');
  const [comprimento, setComprimento] = useState('');
  const [armazem, setArmazem] = useState('');
  const [endereco, setEndereco] = useState('');

  const handleEnviar = async () => {
    if (!localizacao || !tipo || !altura || !largura || !comprimento || !armazem || !endereco) {
      alert('Preencha os campos obrigatórios: nome, tipo, altura, largura, comprimento, armazém e endereço.');
      return;
    }

    try {
      await criarLocalizacao({
        localizacao,
        tipo,
        altura,
        largura,
        comprimento,
        armazem,
        endereco,
      });

      alert('Localização criada com sucesso!');

      // Limpa os campos após envio
      setLocalizacao('');
      setTipo('');
      setAltura('');
      setLargura('');
      setComprimento('');
      setArmazem('');
      setEndereco('');
    } catch (error: any) {
      alert('Erro ao criar localização: ' + error.message);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Teste de Criação de Localização (POST)
        </Typography>

        <TextField
          fullWidth
          label="Nome da Localização"
          value={localizacao}
          onChange={(e) => setLocalizacao(e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Tipo de Localização"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          type="number"
          label="Altura (cm)"
          value={altura}
          onChange={(e) => setAltura(e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          type="number"
          label="Largura (cm)"
          value={largura}
          onChange={(e) => setLargura(e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          type="number"
          label="Comprimento (cm)"
          value={comprimento}
          onChange={(e) => setComprimento(e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Nome do Armazém"
          value={armazem}
          onChange={(e) => setArmazem(e.target.value)}
          margin="normal"
        />

        <TextField
          fullWidth
          label="Endereço do Armazém"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          margin="normal"
        />

        <Box textAlign="center" mt={2}>
          <Button variant="contained" onClick={handleEnviar}>
            Enviar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default TelaTeste;
