import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
    Checkbox,
    Tooltip,
    MenuItem,
    Menu,
} from '@mui/material';
import { Search as SearchIcon, Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon, FilterList as FilterListIcon } from '@mui/icons-material';

import Layout from '../components/Layout';
import { buscarArmazem, excluirArmazem, Armazem as ArmazemAPI } from '../services/API';

/* -------------------------------------------------------------------------- */
// Número de itens por página – seguindo o padrão Tiny ERP
const itemsPerPage = 50;
/* -------------------------------------------------------------------------- */

// Ajuste para incluir capacidade (caso o backend já devolva) ----------------
interface Armazem extends ArmazemAPI {
    capacidade?: number;
}

const ArmazemPage: React.FC = () => {
    /* ----------------------- hooks e estados globais ---------------------- */
    const navigate = useNavigate();

    /* ----------------------- estados de dados ---------------------------- */
    const [listaArmazens, setListaArmazens] = useState<Armazem[]>([]);
    const [busca, setBusca] = useState('');

    /* ----------------------- estados de filtros -------------------------- */
    const [filtroEndereco, setFiltroEndereco] = useState<string>('');

    const [appliedFiltroEndereco, setAppliedFiltroEndereco] = useState<string>('');

    /* ----------------------- estados de seleção -------------------------- */
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState(false);

    /* ----------------------- paginação ----------------------------------- */
    const [currentPage, setCurrentPage] = useState(1);

    /* ----------------------- anchor para menu filtro --------------------- */
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    /* --------------------------------------------------------------------- */
    /* 1. Carrega armazéns do backend                                        */
    /* --------------------------------------------------------------------- */
    useEffect(() => {
        const carregar = async () => {
            try {
                const dados = await buscarArmazem();
                setListaArmazens(dados);
            } catch (error: any) {
                alert(error.message ?? 'Erro ao carregar armazéns.');
            }
        };
        carregar();
    }, []);

    /* --------------------------------------------------------------------- */
    /* 2. Índices filtrados (busca + filtros aplicados)                      */
    /* --------------------------------------------------------------------- */
    const filteredIndices = useMemo(() => {
        return listaArmazens.reduce<number[]>((acc, a, idx) => {
            const termo = busca.trim().toLowerCase();
            const matchBusca =
                termo === '' ||
                [a.nome, a.endereco]
                    .filter(Boolean)
                    .some((campo) => campo.toString().toLowerCase().includes(termo));
            const matchEndereco = !appliedFiltroEndereco || a.endereco === appliedFiltroEndereco;
            if (matchBusca && matchEndereco) acc.push(idx);
            return acc;
        }, []);
    }, [listaArmazens, busca, appliedFiltroEndereco]);

    /* --------------------------------------------------------------------- */
    /* 3. Paginação                                                          */
    /* --------------------------------------------------------------------- */
    const totalPages = Math.ceil(filteredIndices.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentIndices = filteredIndices.slice(startIndex, endIndex);
    const currentItems = currentIndices.map((i) => listaArmazens[i]);

    /* --------------------------------------------------------------------- */
    /* 4. Efeitos auxiliares                                                 */
    /* --------------------------------------------------------------------- */
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages]);

    useEffect(() => {
        setCurrentPage(1);
    }, [busca, appliedFiltroEndereco]);

    useEffect(() => {
        const allCurrentSelected =
            currentIndices.length > 0 && currentIndices.every((idx) => selectedItems.includes(idx));
        setSelectAll(allCurrentSelected);
    }, [selectedItems, currentIndices]);

    /* --------------------------------------------------------------------- */
    /* 5. Handlers – seleção                                                 */
    /* --------------------------------------------------------------------- */
    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        setSelectedItems(checked ? currentIndices : []);
    };

    const handleSelectItem = (originalIndex: number, checked: boolean) => {
        setSelectedItems((prev) =>
            checked ? [...prev, originalIndex] : prev.filter((idx) => idx !== originalIndex)
        );
    };

    /* --------------------------------------------------------------------- */
    /* 6. Handler excluir individual                                         */
    /* --------------------------------------------------------------------- */
    const handleExcluir = async (id: number, nome: string) => {
        if (!window.confirm(`Deseja excluir o armazém "${nome}"?`)) return;
        try {
            await excluirArmazem(id);
            setListaArmazens((prev) => prev.filter((a) => a.armazem_id !== id));
            alert('Armazém excluído com sucesso!');
        } catch (err: any) {
            alert(err.message ?? 'Erro ao excluir armazém.');
        }
    };

    /* --------------------------------------------------------------------- */
    /* 7. Valores únicos para filtros                                        */
    /* --------------------------------------------------------------------- */
    const enderecos = useMemo(
        () => Array.from(new Set(listaArmazens.map((a) => a.endereco).filter(Boolean))).sort(),
        [listaArmazens]
    );

    /* --------------------------------------------------------------------- */
    /* 8. Handlers menu filtros                                              */
    /* --------------------------------------------------------------------- */
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLimparFiltros = () => {
        setFiltroEndereco('');
        setAppliedFiltroEndereco('');
        setBusca('');
        handleMenuClose();
    };

    const handleAplicarFiltro = () => {
        setAppliedFiltroEndereco(filtroEndereco);
        handleMenuClose();
    };

    /* --------------------------------------------------------------------- */
    /* 9. Render                                                             */
    /* --------------------------------------------------------------------- */
    return (
        <Layout totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage}>
            <Container maxWidth="xl" sx={{ marginLeft: '10px' }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                    Armazéns
                </Typography>

                {/* Barra de ações */}
                <Box display="flex" gap={2} mb={3} alignItems="center" flexWrap="wrap">
                    <TextField
                        placeholder="Buscar Armazém ou Endereço"
                        variant="outlined"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                        sx={{ maxWidth: 480, width: 380 }}
                    />

                    <Button
                        variant="outlined"
                        startIcon={<FilterListIcon />}
                        onClick={handleMenuOpen}
                        sx={{ minWidth: 110 }}
                    >
                        Filtro
                    </Button>

                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                        <Box sx={{ p: 2, width: 300 }}>
                            <TextField
                                select
                                label="Endereço"
                                value={filtroEndereco}
                                onChange={(e) => setFiltroEndereco(e.target.value)}
                                sx={{ minWidth: '100%' }}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                {enderecos.map((e) => (
                                    <MenuItem key={e} value={e}>{e}</MenuItem>
                                ))}
                            </TextField>

                            <Button variant="outlined" onClick={handleAplicarFiltro} sx={{ mt: 2, width: '100%' }}>
                                Aplicar Filtro
                            </Button>

                            {filtroEndereco && (
                                <Button variant="outlined" onClick={handleLimparFiltros} sx={{ mt: 2, width: '100%' }}>
                                    Limpar filtros
                                </Button>
                            )}
                        </Box>
                    </Menu>

                    {filtroEndereco && (
                        <Button variant="outlined" onClick={handleLimparFiltros} sx={{ minWidth: 130, ml: 1 }}>
                            Limpar Filtros
                        </Button>
                    )}

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/CriarArmazem')}
                        sx={{ backgroundColor: '#61de27', color: '#000', fontWeight: 'bold', minWidth: 165, '&:hover': { backgroundColor: '#48c307' } }}
                    >
                        Novo Armazém
                    </Button>
                </Box>

                {/* Tabela principal */}
                <TableContainer component={Paper} sx={{ borderRadius: 2, maxHeight: 600, overflow: 'auto' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={selectAll}
                                        indeterminate={selectedItems.length > 0 && !selectAll}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Armazém</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Capacidade</TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Endereço</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 600, color: 'primary.main' }}>Ações</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currentItems.length ? (
                                currentItems.map((item, idx) => {
                                    const originalIndex = currentIndices[idx];
                                    const isSelected = selectedItems.includes(originalIndex);
                                    return (
                                        <TableRow key={`${item.nome}-${originalIndex}`} selected={isSelected} hover>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={(e) => handleSelectItem(originalIndex, e.target.checked)}
                                                />
                                            </TableCell>
                                            <TableCell>{item.nome}</TableCell>
                                            <TableCell>{item.capacidade ?? '-'}</TableCell>
                                            <TableCell>{item.endereco}</TableCell>
                                            <TableCell align="center">
                                                <Box display="flex" justifyContent="center" gap={1}>
                                                    <Tooltip title="Editar armazém">
                                                        <IconButton size="small" onClick={() => navigate(`/editararmazem/${item.armazem_id}`)}>
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Excluir armazém">
                                                        <IconButton size="small" onClick={() => handleExcluir(item.armazem_id, item.nome)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body1" color="text.secondary">Nenhum armazém encontrado.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </Layout>
    );
};

export default ArmazemPage;
