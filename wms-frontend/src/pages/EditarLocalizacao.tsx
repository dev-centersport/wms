import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Divider,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material';


import api from '../services/API';

import {
    buscarLocalizacao,
    buscarTiposDeLocalizacao,
    buscarArmazem,
    atualizarLocalizacao,
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

const EditarLocalizacao: React.FC = () => {
    const { id } = useParams();           // id da URL
    const navigate = useNavigate();

    /* listas para preencher selects --------------------------- */
    const [tipos, setTipos] = useState<TipoLocalizacao[]>([]);
    const [armazens, setArmazens] = useState<Armazem[]>([]);

    /* dados do formulário ------------------------------------- */
    const [formData, setFormData] = useState({
        nome: '',
        tipo_id: 0,
        armazem_id: 0,
        largura: '',
        altura: '',
        comprimento: '',
        ean: '',  // ✅ novo campo
    });


    /* carrega dados ------------------------------------------- */
    useEffect(() => {
        const carregar = async () => {
            try {
                const [listaTipos, listaArmazens, loc] = await Promise.all([
                    buscarTiposDeLocalizacao(),
                    buscarArmazem(),
                    buscarLocalizacao(Number(id)),
                ]);

                setTipos(listaTipos);
                setArmazens(listaArmazens);

                setFormData({
                    nome: loc.nome,
                    tipo_id: Number(loc.tipo?.tipo_localizacao_id ?? 0),
                    armazem_id: Number(loc.armazem?.armazem_id ?? 0),
                    largura: String(loc.largura ?? ''),
                    altura: String(loc.altura ?? ''),
                    comprimento: String(loc.comprimento ?? ''),
                    ean: String(loc.ean ?? ''),  // ✅ novo campo
                });

            } catch (err) {
                console.error('Erro ao carregar dados da localização:', err);
                alert('Erro ao carregar os dados para edição.');
            }
        };

        carregar();
    }, [id]);

    /* helpers -------------------------------------------------- */
    const handleChange = (field: string, value: string | number) =>
        setFormData((prev) => ({ ...prev, [field]: value }));

    const handleSalvar = async () => {
        const payload = {
            nome: formData.nome,
            tipo_localizacao_id: formData.tipo_id,
            armazem_id: formData.armazem_id,
            altura: formData.altura,
            largura: formData.largura,
            comprimento: formData.comprimento,
            ean: formData.ean, // ✅ incluído
        };


        console.log('Payload enviado para PATCH:', payload);

        try {
            await api.patch(`/localizacao/${id}`, payload);
            alert('Localização atualizada com sucesso!');
            navigate('/localizacao');
        } catch (err: any) {
            console.error('❌ Erro no PATCH:', err.message);

            if (err.response) {
                console.error('❌ Status:', err.response.status);
                console.error('❌ Dados da resposta:', err.response.data);
                alert(`Erro ${err.response.status}: ${JSON.stringify(err.response.data)}`);
            } else {
                alert('Erro ao enviar a requisição.');
            }
        }
    };


    /* render --------------------------------------------------- */
    return (
        <Layout pageTitle='Editar Localização'>
            <Divider sx={{ mb: 3 }} />

            {/* --- formulário principal -------------------------- */}
            <Box display="flex" flexDirection="column" gap={2} alignItems="flex-start">
                <TextField
                    label="Nome Localização"
                    fullWidth
                    value={formData.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                />

                <Box display="flex" gap={2} flexWrap="wrap" width="100%">
                    {/* tipo (somente leitura) */}
                    <TextField
                        select
                        label="Tipo"
                        fullWidth
                        sx={{ flex: 1 }}
                        value={formData.tipo_id}
                        disabled
                    >
                        {tipos.length ? (
                            tipos.map((t) => (
                                <MenuItem key={t.tipo_localizacao_id} value={t.tipo_localizacao_id}>
                                    {t.tipo}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem value={0} disabled>
                                Carregando...
                            </MenuItem>
                        )}
                    </TextField>

                    {/* armazém (somente leitura) */}
                    <TextField
                        select
                        label="Armazém"
                        fullWidth
                        sx={{ flex: 1 }}
                        value={formData.armazem_id}
                        disabled
                    >
                        {armazens.length ? (
                            armazens.map((a) => (
                                <MenuItem key={a.armazem_id} value={a.armazem_id}>
                                    {a.nome}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem value={0} disabled>
                                Carregando...
                            </MenuItem>
                        )}
                    </TextField>
                </Box>

                <Typography variant="subtitle1" mt={4} mb={2} fontWeight="bold">
                    Dimensões
                </Typography>

                <Box display="flex" alignItems="center" gap={3}>
                    <Box display="flex" gap={2}>
                        {(['largura', 'altura', 'comprimento'] as const).map((field) => (
                            <TextField
                                key={field}
                                label={field.charAt(0).toUpperCase() + field.slice(1)}
                                type="number"
                                value={formData[field]}
                                onChange={(e) => handleChange(field, e.target.value)}
                                inputProps={{ min: 0, step: 'any' }}
                                InputProps={{ endAdornment: <span>cm</span> }}
                                sx={{ width: 130 }}
                            />
                        ))}
                    </Box>
                    <img src={prateleira} alt="Medição" style={{ width: 90 }} />
                </Box>
            </Box>

            <Divider sx={{ mt: 10, mb: 3 }} />

            {/* botões ------------------------------------------- */}
            <Box display="flex" justifyContent="center" gap={2}>
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
        </Layout>
    );
};

export default EditarLocalizacao;
