import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
    Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/API';
import Layout from "../components/Layout"

interface Perfil {
    perfil_id: number;
    nome: string;
}

export default function CriarUsuario() {
    const [responsavel, setResponsavel] = useState('');
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [cpf, setCpf] = useState('');
    const [nivel, setNivel] = useState(1);
    const [ativo, setAtivo] = useState(true);
    const [perfilId, setPerfilId] = useState<number | ''>('');
    const [perfis, setPerfis] = useState<Perfil[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        async function carregarPerfis() {
            try {
                const { data } = await api.get('/perfil');
                setPerfis(data);
            } catch (error) {
                alert('Erro ao carregar perfis.');
            }
        }
        carregarPerfis();
    }, []);

    async function handleSalvar() {
        try {
            if (!responsavel || !usuario || !senha || !cpf || !perfilId) {
                alert('Preencha todos os campos obrigatórios.');
                return;
            }

            const payload = {
                responsavel,
                usuario,
                senha,
                nivel,
                cpf,
                ativo,
                perfil_id: perfilId,
            };

            await api.post('/usuario', payload);
            alert('Usuário criado com sucesso!');
            navigate('/Usuarios');
        } catch (err) {
            alert('Erro ao criar usuário.');
        }
    }

    return (
        <Layout show={false}>
            <Box p={4}>
                <Typography variant="h5" fontWeight={600} mb={3}>Novo Usuário</Typography>

                <Box mb={3}>
                    <TextField
                        fullWidth
                        label="Nome do Usuário"
                        placeholder="Ex: Luciana Cordeiro"
                        value={responsavel}
                        onChange={(e) => setResponsavel(e.target.value)}
                    />
                </Box>

                <Box display="flex" gap={2} mb={3}>
                    <TextField
                        fullWidth
                        label="Login de acesso"
                        value={usuario}
                        onChange={(e) => setUsuario(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Senha de acesso"
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                    />
                </Box>

                <Box display="flex" gap={2} mb={3}>
                    <TextField
                        fullWidth
                        label="CPF"
                        value={cpf}
                        onChange={(e) => setCpf(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        label="Nível"
                        type="number"
                        value={nivel}
                        onChange={(e) => setNivel(Number(e.target.value))}
                    />
                </Box>

                <Box display="flex" gap={2} alignItems="center" mb={3}>
                    <FormControl fullWidth>
                        <InputLabel id="perfil-label">Perfil de usuário</InputLabel>
                        <Select
                            labelId="perfil-label"
                            value={perfilId}
                            onChange={(e) => setPerfilId(Number(e.target.value))}
                            label="Perfil de usuário"
                            sx={{
                                backgroundColor: '#f5f5f5',
                                fontWeight: 'bold',
                                border: '1px solid #61de27',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                '& .MuiSelect-select': {
                                    color: '#000',
                                },
                            }}
                        >
                            {perfis.map((p) => (
                                <MenuItem key={p.perfil_id} value={p.perfil_id}>
                                    {p.nome}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        onClick={() => navigate('/NovoPerfil')}
                        variant="outlined"
                        sx={{
                            borderColor: '#61de27',
                            color: '#000',
                            fontSize: 13,
                            fontWeight: 'bold',
                            padding: '6px 12px',
                            whiteSpace: 'nowrap',
                            backgroundColor: '#f5fff5',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            '&:hover': {
                                backgroundColor: '#e7ffe7',
                                borderColor: '#4dcc1c',
                            },
                        }}
                    >
                        Criar perfil de usuário
                    </Button>
                </Box>


                <Box display="flex" alignItems="center" mb={4}>
                    <Typography mr={2}>Usuário ativo</Typography>
                    <Switch checked={ativo} onChange={() => setAtivo(!ativo)} />
                </Box>

                <Box display="flex" gap={2}>
                    <Button
                        variant="contained"
                        sx={{ backgroundColor: '#61de27', color: '#000', fontWeight: 'bold' }}
                        onClick={handleSalvar}
                    >
                        Salvar
                    </Button>
                    <Button variant="outlined" onClick={() => navigate('/Usuarios')}>Cancelar</Button>
                </Box>
            </Box>
        </Layout>
    );
}
