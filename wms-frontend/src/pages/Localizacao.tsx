import React, { useEffect, useState } from 'react';
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
  Divider,
  Pagination,
  PaginationItem,
} from '@mui/material';

import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  List as ListIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  ArrowRightAlt as ArrowRightAltIcon,
} from '@mui/icons-material';

import { useLocalizacoes } from '../components/ApiComponents';
import Layout from '../components/Layout';

const itemsPerPage = 5;

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

        const tipoLower = tipo.toLowerCase();
        const isCaixa = tipoLower.includes('caixa');
        const isPrateleira = tipoLower.includes('prateleira');

        // Dimensões e estilos específicos
        const largura = isCaixa ? '10cm' : isPrateleira ? '10cm' : '5cm';
        const altura = isCaixa ? '15cm' : isPrateleira ? '5cm' : '10cm';

        const fontNome = isCaixa ? '120px' : isPrateleira ? '120px' : '120px';
        const barHeight = isCaixa ? 90 : isPrateleira ? 20 : 20;
        const barFont = isCaixa ? 22 : isPrateleira ? 10 : 10;

        // Ajuste do nome impresso para tipo Prateleira
        const nomeImpresso = isPrateleira
        ? localizacao.replace(/^.*A/, 'A')
        : localizacao;




        w.document.write(`
        <html>
        <head>
            <title>Etiqueta – ${localizacao}</title>
            <style>
            @page {
                size: ${largura} ${altura};
                margin: 0;
            }
            body {
                width: ${largura};
                height: ${altura};
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
            <h1 id="nome">${nomeImpresso}</h1>
            <svg id="barcode"></svg>

            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
            <script>
            const nome = document.getElementById('nome');
            const texto = '${nomeImpresso}';
            let tamanhoFonte = ${fontNome.replace('px', '')};

            if (texto.length > 8) {
                tamanhoFonte = 50;
            } else if (texto.length > 6) {
                tamanhoFonte = 75;
            }

            nome.style.fontSize = tamanhoFonte + 'px';

            JsBarcode('#barcode', '${ean}', {
                format: 'ean13',
                height: ${barHeight},
                displayValue: true,
                fontSize: ${barFont}
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
            alert('Selecione pelo menos uma localização.');
            return;
        }

        /* --------- 1. verifica se todos os selecionados têm o MESMO tipo ---------- */
        const tiposSelecionados = selectedItems.map(
            (idx) => listaLocalizacoes[idx].tipo.toLowerCase()
        );
        const tipoUnico = tiposSelecionados.every((t) => t === tiposSelecionados[0]);
        if (!tipoUnico) {
            alert('Imprima apenas etiquetas de um mesmo tipo por vez (todas CAIXA ou todas PRATELEIRA).');
            return;
        }

        const tipoAtual = tiposSelecionados[0];
        const isCaixa = tipoAtual.includes('caixa');
        const isPrateleira = tipoAtual.includes('prateleira');

        /* ---- 2. dimensões gerais da página (uma para todas, cabe duas de 5 cm) --- */
        const pageWidth  = '150mm';   // 15 cm
        const pageHeight = '100mm';   // 10 cm

        const w = window.open('', '_blank');
        if (!w) return;

        /* --------------------------- cabeçalho + estilos -------------------------- */
        w.document.write(`
            <html>
            <head>
                <title>Etiquetas</title>
                <style>
                    @page { size: ${pageWidth} ${pageHeight}; margin: 0; }
                    body   { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                    .etiqueta {
                        width: ${pageWidth};
                        height: ${isCaixa ? pageHeight : '50mm'}; /* prateleira = 5 cm */
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                    }
                    .nome     { margin: 0; font-weight: bold; line-height: 1; text-align: center; width: 100%; }
                    .barcode  { width: 90%; margin-top: 4mm; }
                </style>
            </head>
            <body>
        `);

        /* ----------------------------- conteúdo ---------------------------------- */
        selectedItems.forEach((idx, i) => {
            const item = listaLocalizacoes[idx];
            const nomeEscapado = item.nome.replace(/'/g, "\\'"); // evita quebrar string

            w.document.write(`
                <div class="etiqueta" data-ean="${item.ean}" data-nome="${nomeEscapado}"
                    style="${isCaixa ? 'page-break-after: always;' : ''}">
                    <h1 class="nome" id="nome-${i}">${nomeEscapado}</h1>
                    <svg class="barcode" id="barcode-${i}"></svg>
                </div>
            `);
        });

        /* ------------------- gera códigos + ajusta tamanhos ---------------------- */
        w.document.write(`
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
            <script>
                window.onload = () => {
                    document.querySelectorAll('.etiqueta').forEach((div, index) => {
                        const nome = div.dataset.nome;
                        const ean  = div.dataset.ean;

                        /* fonte adaptativa simples */
                        let tamanho = 120;
                        if (nome.length > 10) tamanho = 50;
                        else if (nome.length > 6) tamanho = 75;
                        document.getElementById('nome-' + index).style.fontSize = tamanho + 'px';

                        JsBarcode('#barcode-' + index, ean, {
                            format: 'ean13',
                            height: ${isCaixa ? 90 : 20},
                            displayValue: true,
                            fontSize: ${isCaixa ? 22 : 10}
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
        <Layout totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage}>
            <Container maxWidth="xl" sx={{ marginLeft: '10px' }}>
                <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                    Localização
                </Typography>

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
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Armazém</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>EAN</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Quantidade</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Ações</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {currentItems.length ? (
                currentItems.map((item, index) => {
                    const globalIndex = startIndex + index;
                    const isSelected = selectedItems.includes(globalIndex);

                    return (
                    <TableRow
                        key={`${item.nome}-${globalIndex}`}
                        selected={isSelected}
                        hover
                    >
                        <TableCell padding="checkbox">
                        <Checkbox
                            checked={isSelected}
                            onChange={(e) => handleSelectItem(globalIndex, e.target.checked)}
                        />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{item.nome}</TableCell>
                        <TableCell>{item.tipo}</TableCell>
                        <TableCell>{item.armazem}</TableCell>
                        <TableCell>{item.ean}</TableCell>
                        <TableCell>{item.quantidade}</TableCell>
                        <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={1}>
                            <Tooltip title="Ver produtos">
                            <IconButton
                                size="small"
                                onClick={() => alert(`Ver produtos em ${item.nome}`)}
                            >
                                <ListIcon fontSize="small" />
                            </IconButton>
                            </Tooltip>

                            <Tooltip title="Imprimir etiqueta">
                            <IconButton
                                size="small"
                                onClick={() => handleImprimir(item.nome, item.ean)}
                            >
                                <PrintIcon fontSize="small" />
                            </IconButton>
                            </Tooltip>

                            <Tooltip title="Excluir localização">
                            <IconButton
                                size="small"
                                onClick={() => handleExcluir(globalIndex)}
                                disabled={item.quantidade > 0}
                                sx={{
                                color: item.quantidade > 0 ? 'text.disabled' : 'error.main',
                                '&:hover': {
                                    backgroundColor: item.quantidade > 0 ? 'transparent' : 'rgba(211, 47, 47, 0.1)'
                                }
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