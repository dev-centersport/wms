import React, { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Button,
    Chip,
    IconButton,
    InputAdornment,
    Menu,
    MenuItem,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    Alert,
    Snackbar,
} from '@mui/material';
import { Search, Edit, Delete } from '@mui/icons-material';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { buscarUsuarios, excluirUsuario, atualizarUsuario, buscarUsuarioPorId, buscarPerfis } from '../services/API';

interface Usuario {
    usuario_id: number;
    responsavel: string;
    usuario: string;
    perfil: {
        nome: string;
    };
}

const ITEMS_PER_PAGE = 50;

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [busca, setBusca] = useState('');
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [filtroPerfil, setFiltroPerfil] = useState('');
    const [appliedFiltroPerfil, setAppliedFiltroPerfil] = useState('');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();

    // Estados para edição e exclusão
    const [editarDialogOpen, setEditarDialogOpen] = useState(false);
    const [excluirDialogOpen, setExcluirDialogOpen] = useState(false);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);
    const [perfis, setPerfis] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        responsavel: '',
        usuario: '',
        nivel: 1,
        cpf: '',
        ativo: true,
        perfil_id: 0
    });
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'info' | 'warning'
    });

    useEffect(() => {
        async function carregarUsuarios() {
            try {
                const data = await buscarUsuarios(); // ✅ chama a API centralizada
                setUsuarios(data);
            } catch (error) {
                alert('Erro ao buscar usuários.');
            }
        }
        carregarUsuarios();
    }, []);

    useEffect(() => {
        async function carregarPerfis() {
            try {
                const data = await buscarPerfis();
                setPerfis(data);
            } catch (error) {
                console.error('Erro ao carregar perfis:', error);
            }
        }
        carregarPerfis();
    }, []);

    const handleEditar = async (usuario: Usuario) => {
        try {
            setLoading(true);
            const usuarioCompleto = await buscarUsuarioPorId(usuario.usuario_id);
            setFormData({
                responsavel: usuarioCompleto.responsavel || '',
                usuario: usuarioCompleto.usuario || '',
                nivel: usuarioCompleto.nivel || 1,
                cpf: usuarioCompleto.cpf || '',
                ativo: usuarioCompleto.ativo !== false,
                perfil_id: usuarioCompleto.perfil?.perfil_id || 0
            });
            setUsuarioSelecionado(usuario);
            setEditarDialogOpen(true);
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Erro ao carregar dados do usuário',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExcluir = (usuario: Usuario) => {
        setUsuarioSelecionado(usuario);
        setExcluirDialogOpen(true);
    };

    const confirmarExclusao = async () => {
        if (!usuarioSelecionado) return;
        
        try {
            setLoading(true);
            await excluirUsuario(usuarioSelecionado.usuario_id);
            
            // Atualiza a lista local
            setUsuarios(prev => prev.filter(u => u.usuario_id !== usuarioSelecionado.usuario_id));
            
            setSnackbar({
                open: true,
                message: 'Usuário excluído com sucesso!',
                severity: 'success'
            });
            setExcluirDialogOpen(false);
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Erro ao excluir usuário',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const salvarEdicao = async () => {
        if (!usuarioSelecionado) return;
        
        try {
            setLoading(true);
            const dadosAtualizados = { ...formData };
            
            await atualizarUsuario(usuarioSelecionado.usuario_id, dadosAtualizados);
            
            // Recarrega os dados do usuário atualizado do backend
            const usuarioAtualizado = await buscarUsuarioPorId(usuarioSelecionado.usuario_id);
            
            // Atualiza a lista local com os dados reais do backend
            setUsuarios(prev => prev.map(u => 
                u.usuario_id === usuarioSelecionado.usuario_id 
                    ? { 
                        ...u, 
                        responsavel: usuarioAtualizado.responsavel,
                        usuario: usuarioAtualizado.usuario,
                        perfil: usuarioAtualizado.perfil ? { nome: usuarioAtualizado.perfil.nome } : u.perfil
                    }
                    : u
            ));
            
            setSnackbar({
                open: true,
                message: 'Usuário atualizado com sucesso!',
                severity: 'success'
            });
            setEditarDialogOpen(false);
        } catch (error: any) {
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'Erro ao atualizar usuário',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const perfisFiltro = useMemo(() => {
        return Array.from(new Set(usuarios.map(u => u.perfil?.nome).filter(Boolean))).sort();
    }, [usuarios]);

    const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleAplicarFiltro = () => {
        setAppliedFiltroPerfil(filtroPerfil);
        setPaginaAtual(1);
        handleMenuClose();
    };

    const handleLimparFiltro = () => {
        setFiltroPerfil('');
        setAppliedFiltroPerfil('');
        setPaginaAtual(1);
        handleMenuClose();
    };

    const filtrado = useMemo(() => {
        const termo = busca.toLowerCase();
        return usuarios.filter(u => {
            const matchBusca =
                u.responsavel.toLowerCase().includes(termo) ||
                u.usuario.toLowerCase().includes(termo) ||
                u.perfil?.nome?.toLowerCase().includes(termo);
            const matchPerfil =
                !appliedFiltroPerfil ||
                u.perfil?.nome?.toLowerCase().includes(appliedFiltroPerfil.toLowerCase());
            return matchBusca && matchPerfil;
        });
    }, [usuarios, busca, appliedFiltroPerfil]);

    const totalPaginas = Math.ceil(filtrado.length / ITEMS_PER_PAGE) || 1;
    const exibidos = filtrado.slice((paginaAtual - 1) * ITEMS_PER_PAGE, paginaAtual * ITEMS_PER_PAGE);

    return (
        <Layout totalPages={totalPaginas} currentPage={paginaAtual} onPageChange={setPaginaAtual}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h4" fontWeight={600}>Usuários</Typography>
            </Box>

            <Box display="flex" gap={2} alignItems="center" mb={2} flexWrap="wrap">
                <TextField
                    placeholder="Busca por nome, usuário ou perfil"
                    size="small"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        )
                    }}
                    sx={{ width: 400 }}
                />

                <Button
                    variant="outlined"
                    onClick={handleMenuOpen}
                    sx={{
                        minWidth: 110,
                        backgroundColor: appliedFiltroPerfil ? '#f0f0f0' : 'transparent',
                        borderColor: appliedFiltroPerfil ? '#999' : undefined,
                        color: appliedFiltroPerfil ? '#333' : undefined,
                        fontWeight: appliedFiltroPerfil ? 'bold' : 'normal',
                    }}
                >
                    Filtro
                </Button>

                {appliedFiltroPerfil && (
                    <Chip
                        label={`Perfil: ${appliedFiltroPerfil}`}
                        sx={{
                            backgroundColor: '#61de27',
                            color: '#000',
                            fontWeight: 'bold',
                            height: 32,
                        }}
                    />
                )}

                {appliedFiltroPerfil && (
                    <Button variant="outlined" onClick={handleLimparFiltro}>
                        Limpar Filtro
                    </Button>
                )}

                <Button
                    variant="contained"
                    sx={{ backgroundColor: '#61de27', color: '#000', fontWeight: 'bold' }}
                    onClick={() => navigate('/CriarUsuario')}
                >
                    Novo Usuário
                </Button>

            </Box>

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <Box sx={{ p: 2, width: 260, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        select
                        label="Perfil do Usuário"
                        value={filtroPerfil}
                        onChange={(e) => setFiltroPerfil(e.target.value)}
                    >
                        <MenuItem value="">Todos</MenuItem>
                        {perfisFiltro.map((p) => (
                            <MenuItem key={p} value={p}>{p}</MenuItem>
                        ))}
                    </TextField>
                    <Button variant="outlined" onClick={handleAplicarFiltro}>Aplicar</Button>
                </Box>
            </Menu>

            <TableContainer component={Paper}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Responsável</TableCell>
                            <TableCell>Usuário</TableCell>
                            <TableCell>Perfil</TableCell>
                            <TableCell align="center">Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {exibidos.map((usuario) => (
                            <TableRow key={usuario.usuario_id}>
                                <TableCell>{usuario.responsavel}</TableCell>
                                <TableCell>{usuario.usuario}</TableCell>
                                <TableCell>{usuario.perfil?.nome}</TableCell>
                                <TableCell align="center">
                                    <IconButton onClick={() => handleEditar(usuario)} disabled={loading}>
                                        <Edit />
                                    </IconButton>
                                    <IconButton onClick={() => handleExcluir(usuario)} disabled={loading}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal de Edição */}
            <Dialog open={editarDialogOpen} onClose={() => setEditarDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Editar Usuário</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Responsável"
                            value={formData.responsavel}
                            onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label="Usuário"
                            value={formData.usuario}
                            onChange={(e) => setFormData(prev => ({ ...prev, usuario: e.target.value }))}
                            fullWidth
                        />
                        <TextField
                            label="CPF"
                            value={formData.cpf}
                            onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Nível</InputLabel>
                            <Select
                                value={formData.nivel}
                                onChange={(e) => setFormData(prev => ({ ...prev, nivel: Number(e.target.value) }))}
                                label="Nível"
                            >
                                <MenuItem value={1}>1 - Básico</MenuItem>
                                <MenuItem value={2}>2 - Intermediário</MenuItem>
                                <MenuItem value={3}>3 - Avançado</MenuItem>
                                <MenuItem value={4}>4 - Administrador</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Perfil</InputLabel>
                            <Select
                                value={formData.perfil_id}
                                onChange={(e) => setFormData(prev => ({ ...prev, perfil_id: Number(e.target.value) }))}
                                label="Perfil"
                            >
                                <MenuItem value={0}>Selecione um perfil</MenuItem>
                                {perfis.map((perfil) => (
                                    <MenuItem key={perfil.perfil_id} value={perfil.perfil_id}>
                                        {perfil.nome}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formData.ativo ? 1 : 0}
                                onChange={(e) => setFormData(prev => ({ ...prev, ativo: Boolean(e.target.value) }))}
                                label="Status"
                            >
                                <MenuItem value={1}>Ativo</MenuItem>
                                <MenuItem value={0}>Inativo</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditarDialogOpen(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={salvarEdicao} variant="contained" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Confirmação de Exclusão */}
            <Dialog open={excluirDialogOpen} onClose={() => setExcluirDialogOpen(false)}>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogContent>
                    <Typography>
                        Tem certeza que deseja excluir o usuário <strong>{usuarioSelecionado?.responsavel}</strong>?
                        <br />
                        Esta ação não pode ser desfeita.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setExcluirDialogOpen(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={confirmarExclusao} variant="contained" color="error" disabled={loading}>
                        {loading ? 'Excluindo...' : 'Excluir'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para notificações */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert 
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Layout>
    );
}
