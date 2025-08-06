import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    IconButton,
    Box,
    Chip,
    Avatar,
    Divider,
    Alert,
    LinearProgress,
    Tooltip,
    Badge
} from '@mui/material';
import {
    Close as CloseIcon,
    Warning,
    TrendingUp,
    TrendingDown,
    Inventory,
    QrCode,
    Assessment,
    Error
} from '@mui/icons-material';

interface ProdutoDaOcorrencia {
    produto_id: number;
    descricao: string;
    sku: string;
    ean: string;
    qtd_sistema: number;
    qtd_esperada: number;
    diferenca: number;
    qtd_ocorrencias_produto: number;
}

interface ProdutosOcorrenciaModalProps {
    open: boolean;
    onClose: () => void;
    ocorrenciaNome: string;
    produtos: ProdutoDaOcorrencia[];
}

const ProdutosOcorrenciaModal: React.FC<ProdutosOcorrenciaModalProps> = ({
    open,
    onClose,
    ocorrenciaNome,
    produtos
}) => {
    const totalOcorrencias = produtos.reduce((sum, p) => sum + p.qtd_ocorrencias_produto, 0);
    const totalDiferencas = produtos.reduce((sum, p) => sum + Math.abs(p.diferenca), 0);
    const produtosComProblema = produtos.filter(p => p.diferenca !== 0).length;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="lg"
            PaperProps={{ 
                sx: { 
                    borderRadius: 4, 
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                    overflow: 'hidden'
                } 
            }}
        >
            {/* Header moderno */}
            <Box sx={{
                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                color: 'white',
                p: 3,
                position: 'relative'
            }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
                            <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Detalhes da Ocorrência
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            {ocorrenciaNome}
                        </Typography>
                    </Box>
                    <IconButton 
                        onClick={onClose} 
                        sx={{ 
                            color: 'white',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </Box>
                
                {/* Estatísticas rápidas */}
                <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: 2, 
                    mt: 3 
                }}>
                    <Box sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.1)', 
                        p: 2, 
                        borderRadius: 2,
                        textAlign: 'center'
                    }}>
                        <Typography variant="h4" fontWeight={700}>{produtos.length}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>Produtos</Typography>
                    </Box>
                    <Box sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.1)', 
                        p: 2, 
                        borderRadius: 2,
                        textAlign: 'center'
                    }}>
                        <Typography variant="h4" fontWeight={700} color="white">{totalOcorrencias}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>Ocorrências</Typography>
                    </Box>
                    <Box sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.1)', 
                        p: 2, 
                        borderRadius: 2,
                        textAlign: 'center'
                    }}>
                        <Typography variant="h4" fontWeight={700} color="white">{produtosComProblema}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>Com Problema</Typography>
                    </Box>
                    <Box sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.1)', 
                        p: 2, 
                        borderRadius: 2,
                        textAlign: 'center'
                    }}>
                        <Typography variant="h4" fontWeight={700} color="white">{totalDiferencas}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>Diferença Total</Typography>
                    </Box>
                </Box>
            </Box>

            <DialogContent sx={{ p: 0 }}>
                {produtos.length === 0 ? (
                    <Box sx={{ 
                        p: 6, 
                        textAlign: 'center',
                        backgroundColor: '#f8f9fa'
                    }}>
                        <Inventory sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                            Nenhum produto encontrado
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Não há produtos registrados para esta ocorrência.
                        </Typography>
                    </Box>
                ) : (
                    <Box>
                        {/* Alert de resumo */}
                        <Alert 
                            severity="warning" 
                            sx={{ 
                                m: 2, 
                                borderRadius: 2,
                                '& .MuiAlert-icon': { fontSize: 28 }
                            }}
                        >
                            <Typography variant="body1" fontWeight={600}>
                                {produtosComProblema} de {produtos.length} produtos apresentam divergências
                            </Typography>
                        </Alert>

                        <TableContainer sx={{ maxHeight: 500 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow sx={{ 
                                        backgroundColor: '#f8f9fa',
                                        '& th': { 
                                            fontWeight: 700,
                                            fontSize: '0.875rem',
                                            color: '#495057',
                                            borderBottom: '2px solid #dee2e6'
                                        }
                                    }}>
                                        <TableCell align="center" sx={{ minWidth: 200 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Inventory sx={{ mr: 1, fontSize: 18 }} />
                                                Produto
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center" sx={{ minWidth: 120 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <QrCode sx={{ mr: 1, fontSize: 18 }} />
                                                EAN
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center" sx={{ minWidth: 100 }}>SKU</TableCell>
                                        <TableCell align="center" sx={{ minWidth: 120 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Assessment sx={{ mr: 1, fontSize: 18 }} />
                                                Sistema
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center" sx={{ minWidth: 120 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Inventory sx={{ mr: 1, fontSize: 18 }} />
                                                Gaveta
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center" sx={{ minWidth: 120 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {totalDiferencas > 0 ? <TrendingDown sx={{ mr: 1, fontSize: 18, color: '#333' }} /> : <TrendingUp sx={{ mr: 1, fontSize: 18, color: '#4CAF50' }} />}
                                                Diferença
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center" sx={{ minWidth: 150 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Error sx={{ mr: 1, fontSize: 18, color: '#333' }} />
                                                Ocorrências
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {produtos.map((p, i) => (
                                        <TableRow 
                                            key={p.produto_id || `produto-${i}`} 
                                            hover
                                            sx={{ 
                                                '&:hover': { backgroundColor: '#f8f9fa' },
                                                '&:nth-of-type(odd)': { backgroundColor: '#fafbfc' }
                                            }}
                                        >
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                                                        {p.descricao}
                                                    </Typography>
                                                    <Chip 
                                                        label={p.sku} 
                                                        size="small" 
                                                        variant="outlined"
                                                        sx={{ fontSize: '0.75rem' }}
                                                    />
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" fontFamily="monospace" sx={{ fontSize: '0.875rem' }}>
                                                    {p.ean}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" fontWeight={500}>
                                                    {p.sku}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" fontWeight={600} color="#333">
                                                    {p.qtd_sistema}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" fontWeight={600} color="#4CAF50">
                                                    {p.qtd_esperada}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    icon={p.diferenca < 0 ? <TrendingDown /> : <TrendingUp />}
                                                    label={p.diferenca < 0 ? `-${Math.abs(p.diferenca)}` : `+${p.diferenca}`}
                                                    sx={{ 
                                                        fontWeight: 600,
                                                        backgroundColor: p.diferenca < 0 ? '#333' : '#4CAF50',
                                                        color: 'white'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Badge 
                                                    badgeContent={p.qtd_ocorrencias_produto} 
                                                    sx={{
                                                        '& .MuiBadge-badge': {
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            backgroundColor: '#333',
                                                            color: 'white'
                                                        }
                                                    }}
                                                >
                                                    <Avatar sx={{ 
                                                        width: 32, 
                                                        height: 32, 
                                                        backgroundColor: '#4CAF50',
                                                        fontSize: '0.875rem'
                                                    }}>
                                                        <Error sx={{ fontSize: 18 }} />
                                                    </Avatar>
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ 
                p: 3, 
                borderTop: '1px solid #e0e0e0',
                backgroundColor: '#f8f9fa'
            }}>
                <Button 
                    onClick={onClose} 
                    variant="contained" 
                    sx={{ 
                        minWidth: 120, 
                        fontWeight: 600,
                        borderRadius: 2,
                        px: 3,
                        py: 1.5,
                        background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                        '&:hover': {
                            background: 'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)'
                        }
                    }}
                >
                    Fechar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProdutosOcorrenciaModal;
