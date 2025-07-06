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
import { Search as SearchIcon, Delete as DeleteIcon, Print as PrintIcon, List as ListIcon, Add as AddIcon, FilterList as FilterListIcon } from '@mui/icons-material';

import Layout from '../components/Layout';
import { useLocalizacoes } from '../components/ApiComponents';
import { excluirLocalizacao } from '../services/API';

/* -------------------------------------------------------------------------- */
const itemsPerPage = 5;
/* -------------------------------------------------------------------------- */

const Localizacao: React.FC = () => {
    /* ------------------------- estados globais do hook ------------------------ */
    const {
        listaLocalizacoes,
        busca,
        setBusca,
        setListaLocalizacoes,
    } = useLocalizacoes();

    const navigate = useNavigate();

    /* ---------------------------- estados locais ----------------------------- */
    const [filtroTipo, setFiltroTipo] = useState<string>('');
    const [filtroArmazem, setFiltroArmazem] = useState<string>('');

    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    /* ------------------------------ filtragem ------------------------------ */
    const [appliedFiltroTipo, setAppliedFiltroTipo] = useState<string>('');
    const [appliedFiltroArmazem, setAppliedFiltroArmazem] = useState<string>('');

    const filteredIndices = useMemo(() => {
        return listaLocalizacoes.reduce<number[]>((acc, loc, idx) => {
            const termo = busca.trim().toLowerCase();
            const matchBusca =
                termo === '' ||
                [loc.nome, loc.tipo, loc.armazem, loc.ean]
                    .filter(Boolean)
                    .some((campo) => campo.toString().toLowerCase().includes(termo));

            const matchTipo = !appliedFiltroTipo || loc.tipo === appliedFiltroTipo;
            const matchArmazem = !appliedFiltroArmazem || loc.armazem === appliedFiltroArmazem;

            if (matchBusca && matchTipo && matchArmazem) acc.push(idx);
            return acc;
        }, []);
    }, [listaLocalizacoes, busca, appliedFiltroTipo, appliedFiltroArmazem]);

    /* ---------------------------- paginação ---------------------------- */
    const totalPages = Math.ceil(filteredIndices.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentIndices = filteredIndices.slice(startIndex, endIndex);
    const currentItems = currentIndices.map((i) => listaLocalizacoes[i]);

    /* ------------------------- efeitos auxiliares ------------------------ */
    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [totalPages]);

    useEffect(() => {
        setCurrentPage(1);
    }, [busca, appliedFiltroTipo, appliedFiltroArmazem]);

    useEffect(() => {
        const allCurrentSelected =
            currentIndices.length > 0 && currentIndices.every((idx) => selectedItems.includes(idx));
        setSelectAll(allCurrentSelected);
    }, [selectedItems, currentIndices]);

    /* --------------------------- seleção tabela -------------------------- */
    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked);
        setSelectedItems(checked ? currentIndices : []);
    };

    const handleSelectItem = (originalIndex: number, checked: boolean) => {
        setSelectedItems((prev) =>
            checked ? [...prev, originalIndex] : prev.filter((idx) => idx !== originalIndex)
        );
    };

    /* --------------------------- impressão --------------------------- */
    const handleImprimir = (localizacao: string, ean: string, tipo: string) => {
        const w = window.open('', '_blank');
        if (!w) return;

        const isCaixa = tipo.toLowerCase().includes('caixa');
        const largura = isCaixa ? '10cm' : '5cm';
        const altura = isCaixa ? '15cm' : '10cm';
        const fontNome = isCaixa ? '120px' : '80px';  // Menor para prateleira
        const barHeight = isCaixa ? 90 : 50;  // Menor para prateleira
        const barFont = isCaixa ? 22 : 12;  // Menor para prateleira

        w.document.write(`
        <html>
        <head>
            <title>Etiqueta – ${localizacao}</title>
            <style>
            @page {
                size: 150mm 100mm;
                margin: 0;
            }
            body {
                width: 150mm;
                height: 100mm;
                margin: 0;
                padding: 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
                overflow: hidden;
            }
            #nome {
                margin: 0;
                line-height: 1;
                font-weight: bold;
                width: 100%;
                text-align: center;
                word-break: break-word;
            }
            #barcode {
                width: 90%;
                margin-top: 4mm;
            }
            </style>
        </head>
        <body>
            <h1 id="nome">${localizacao}</h1>
            <svg id="barcode"></svg>

            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
            <script>
            // Ajusta o tamanho da fonte conforme o comprimento do texto
            const nome = document.getElementById('nome');
            const texto = '${localizacao}';
            let tamanhoFonte = 190;

            if (texto.length > 10) {
                tamanhoFonte = 70;
            } else if (texto.length > 8) {
                tamanhoFonte = 85;
            }

            nome.style.fontSize = tamanhoFonte + 'px';

            // Gera o código de barras
            JsBarcode('#barcode', '${ean}', {
                format: 'ean13',
                height: 60,
                displayValue: true,
                fontSize: 18
            });

            window.onload = () => {
                window.print();
                window.onafterprint = () => window.close();
            };
            </script>
        </body>
        </html>
    `);

        w.document.close();
    };

    const handleImprimirSelecionados = () => {
        if (!selectedItems.length) {
            alert('Selecione pelo menos um item para imprimir.');
            return;
        }


        const w = window.open('', '_blank');
        if (!w) return;

        // 1. Cabeçalho + estilos
        w.document.write(`
        <html>
        <head>
        <title>Etiquetas</title>
        <style>
            @page {
            size: 150mm 100mm;
            margin: 0;
            }
            body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            }
            .etiqueta {
            width: 150mm;
            height: 100mm;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            page-break-after: always;
            }
            .nome {
            margin: 0;
            font-weight: bold;
            line-height: 1;
            text-align: center;
            width: 100%;
            word-break: break-word;
            }
            .barcode {
            width: 90%;
            margin-top: 4mm;
            }
        </style>
        </head>
        <body>
    `);

        // 2. Conteúdo das etiquetas
        selectedItems.forEach((idx, i) => {
            const item = listaLocalizacoes[idx];
            const nome = item.nome.replace(/'/g, "\\'"); // evitar problemas com aspas

            w.document.write(`
        <div class="etiqueta" data-ean="${item.ean}" data-nome="${nome}">
            <h1 class="nome" id="nome-${i}">${nome}</h1>
            <svg class="barcode" id="barcode-${i}"></svg>
        </div>
        `);
        });

        // 3. Script para ajustar tamanho da fonte e gerar os códigos
        w.document.write(`
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <script>
        window.onload = () => {
            const etiquetas = document.querySelectorAll('.etiqueta');

            etiquetas.forEach((etq, index) => {
            const nome = etq.dataset.nome;
            const ean = etq.dataset.ean;

            let tamanhoFonte = 190;
            if (nome.length > 10) {
                tamanhoFonte = 70;
            } else if (nome.length > 6) {
                tamanhoFonte = 85;
            }

            const nomeEl = document.getElementById('nome-' + index);
            nomeEl.style.fontSize = tamanhoFonte + 'px';

            const barcodeEl = document.getElementById('barcode-' + index);
            JsBarcode(barcodeEl, ean, {
                format: 'ean13',
                height: 60,
                displayValue: true,
                fontSize: 18
            });
            });

            window.print();
            window.onafterprint = () => window.close();
        };
        </script>
        </body>
        </html>
    `);

        w.document.close();
    };





    /* ------------------------- exclusão ------------------------- */
    const handleExcluir = async (id: number, nome: string, quantidade: number) => {
        if (quantidade > 0) {
            alert('Só é possível excluir localizações com quantidade 0.');
            return;
        }
        if (!window.confirm(`Deseja excluir a localização "${nome}"?`)) return;
        try {
            await excluirLocalizacao({ localizacao_id: id });
            setListaLocalizacoes((prev) => prev.filter((l) => l.localizacao_id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleExcluirSelecionados = async () => {
        if (!selectedItems.length) {
            alert('Selecione pelo menos uma localização.');
            return;
        }

        const permitidos = selectedItems.filter((idx) => listaLocalizacoes[idx].quantidade === 0);
        const bloqueados = selectedItems.filter((idx) => listaLocalizacoes[idx].quantidade > 0);

        if (!permitidos.length) {
            alert('Nenhuma das localizações selecionadas pode ser excluída (quantidade > 0).');
            return;
        }

        const nomesPermitidos = permitidos.map((idx) => listaLocalizacoes[idx].nome);
        if (!window.confirm(`Tem certeza que deseja excluir:\n\n${nomesPermitidos.join(', ')}`)) return;

        const erros: string[] = [];
        for (const idx of permitidos) {
            const loc = listaLocalizacoes[idx];
            try {
                await excluirLocalizacao({ localizacao_id: loc.localizacao_id });
            } catch (err) {
                console.error(err);
                erros.push(loc.nome);
            }
        }

        setListaLocalizacoes((prev) =>
            prev.filter((_, idx) => !permitidos.includes(idx) || erros.includes(prev[idx].nome))
        );

        setSelectedItems([]);
        setSelectAll(false);

        if (erros.length) {
            alert(`Algumas localizações não foram excluídas: ${erros.join(', ')}`);
        } else {
            alert('Localizações excluídas com sucesso!');
        }

        if (bloqueados.length) {
            const nomesBloq = bloqueados.map((idx) => listaLocalizacoes[idx].nome);
            alert(`Estas localizações não puderam ser excluídas por conter produtos:\n\n${nomesBloq.join(', ')}`);
        }
    };

    /* ---------------------- valores únicos para filtros --------------------- */
    const tipos = useMemo(
        () => Array.from(new Set(listaLocalizacoes.map((l) => l.tipo).filter(Boolean))).sort(),
        [listaLocalizacoes]
    );
    const armazens = useMemo(
        () => Array.from(new Set(listaLocalizacoes.map((l) => l.armazem).filter(Boolean))).sort(),
        [listaLocalizacoes]
    );

    /* --------------------------- handlers menu --------------------------- */
    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLimparFiltros = () => {
        setFiltroTipo('');
        setFiltroArmazem('');
        setBusca('');
        setAppliedFiltroTipo('');
        setAppliedFiltroArmazem('');
        handleMenuClose();
    };

    const handleAplicarFiltro = () => {
        setAppliedFiltroTipo(filtroTipo);
        setAppliedFiltroArmazem(filtroArmazem);
        handleMenuClose();
    };

    return (
        <Layout totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} pageTitle='Localização'>
            {/* Barra de ações */}
            <Box display="flex" gap={2} mb={3} alignItems="center" flexWrap="wrap">
                <TextField
                    placeholder="Buscar Localização, tipo, armazém ou EAN"
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

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <Box sx={{ p: 2, width: 300 }}>
                        <TextField
                            select
                            label="Tipo"
                            value={filtroTipo}
                            onChange={(e) => setFiltroTipo(e.target.value)}
                            sx={{ minWidth: '100%' }}
                        >
                            <MenuItem value="">Todos</MenuItem>
                            {tipos.map((t) => (
                                <MenuItem key={t} value={t}>
                                    {t}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Armazém"
                            value={filtroArmazem}
                            onChange={(e) => setFiltroArmazem(e.target.value)}
                            sx={{ minWidth: '100%', mt: 2 }}
                        >
                            <MenuItem value="">Todos</MenuItem>
                            {armazens.map((a) => (
                                <MenuItem key={a} value={a}>
                                    {a}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Button
                            variant="outlined"
                            onClick={handleAplicarFiltro}
                            sx={{ mt: 2, width: '100%' }}
                        >
                            Aplicar Filtro
                        </Button>

                        {filtroTipo || filtroArmazem ? (
                            <Button
                                variant="outlined"
                                onClick={handleLimparFiltros}
                                sx={{ mt: 2, width: '100%' }}
                            >
                                Limpar filtros
                            </Button>
                        ) : null}
                    </Box>
                </Menu>

                {/* Novo botão Limpar Filtros ao lado do botão Filtro */}
                {(filtroTipo || filtroArmazem) && (
                    <Button
                        variant="outlined"
                        onClick={handleLimparFiltros}
                        sx={{ minWidth: 130, ml: 1 }}
                    >
                        Limpar Filtros
                    </Button>
                )}

                {selectedItems.length > 0 ? (
                    <>
                        <Button
                            variant="contained"
                            startIcon={<PrintIcon />}
                            onClick={handleImprimirSelecionados}
                            sx={{
                                backgroundColor: '#61de27',
                                color: '#000',
                                fontWeight: 'bold',
                                minWidth: 195,
                                '&:hover': { backgroundColor: '#48c307' },
                            }}
                        >
                            Imprimir Selecionados
                        </Button>

                        <Button
                            variant="outlined"
                            startIcon={<DeleteIcon />}
                            onClick={handleExcluirSelecionados}
                            sx={{
                                borderColor: '#d32f2f',
                                color: '#d32f2f',
                                fontWeight: 'bold',
                                minWidth: 185,
                                '&:hover': {
                                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                    borderColor: '#d32f2f',
                                },
                            }}
                        >
                            Excluir Selecionados
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/CriarLocalizacao')}
                        sx={{
                            backgroundColor: '#61de27',
                            color: '#000',
                            fontWeight: 'bold',
                            minWidth: 165,
                            '&:hover': { backgroundColor: '#48c307' },
                        }}
                    >
                        Nova Localização
                    </Button>
                )}
            </Box>

            {/* Tabela principal */}
            <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    checked={selectAll}
                                    indeterminate={selectedItems.length > 0 && !selectAll}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Nome</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Tipo</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>Armazém</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: 'primary.main' }}>EAN</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600, color: 'primary.main' }}>Quantidade</TableCell>
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
                                        <TableCell
                                            sx={{
                                                fontWeight: 500,
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => navigate(`/localizacao/${item.localizacao_id}/editar`)}

                                        >
                                            {item.nome}
                                        </TableCell>
                                        <TableCell>{item.tipo}</TableCell>


                                        <TableCell>{item.armazem}</TableCell>
                                        <TableCell align="center">{item.ean}</TableCell>
                                        <TableCell align="center">{item.quantidade}</TableCell>

                                        <TableCell align="center">
                                            <Box display="flex" justifyContent="center" gap={1}>
                                                <Tooltip title="Ver produtos">
                                                    <IconButton size="small" onClick={() => alert(`Ver produtos em ${item.nome}`)}>
                                                        <ListIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Imprimir etiqueta">
                                                    <IconButton size="small" onClick={() => handleImprimir(item.nome, item.ean, item.tipo)}>
                                                        <PrintIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Excluir localização">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleExcluir(item.localizacao_id, item.nome, item.quantidade ?? 0)}
                                                        disabled={item.quantidade > 0}
                                                        sx={{
                                                            color: item.quantidade > 0 ? 'text.disabled' : 'error.main',
                                                            '&:hover': {
                                                                backgroundColor:
                                                                    item.quantidade > 0 ? 'transparent' : 'rgba(211, 47, 47, 0.1)',
                                                            },
                                                        }}
                                                    >
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
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        Nenhuma localização encontrada.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Layout>
    );
};

export default Localizacao;
