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
    Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

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
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' } }}
        >
            <DialogTitle sx={{
                backgroundColor: '#f5f5f5',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e0e0e0'
            }}>
                <Typography fontWeight={600}>
                    Produtos na Ocorrência {ocorrenciaNome}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                {produtos.length === 0 ? (
                    <Box p={3} textAlign="center">
                        <Typography color="text.secondary">Nenhum produto encontrado para esta ocorrência.</Typography>
                    </Box>
                ) : (
                    <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                                    <TableCell sx={{ fontWeight: 600 }} align='center'>Descrição</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }} align='center'>EAN</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }} align='center'>SKU</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }} align="center">Qtd. Sistema</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }} align="center">Qtd. Gaveta</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }} align="center">Diferença</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }} align="center">Qtd. Ocorrências Produto</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {produtos.map((p, i) => (
                                    <TableRow key={p.produto_id || `produto-${i}`} hover>
                                        <TableCell>{p.descricao}</TableCell>
                                        <TableCell>{p.ean}</TableCell>
                                        <TableCell>{p.sku}</TableCell>
                                        <TableCell align="center">{p.qtd_sistema}</TableCell>
                                        <TableCell align="center">{p.qtd_esperada}</TableCell>
                                        <TableCell align="center">
                                            <Typography
                                                fontWeight={600}
                                                color={p.diferenca < 0 ? 'error' : 'success.main'}
                                                sx={{ mr: p.diferenca < 0 ? 0.72 : 0 }}
                                            >
                                                {p.diferenca < 0 ? `- ${Math.abs(p.diferenca)}` : p.diferenca}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Typography
                                                fontWeight={600}
                                                color={'error'}
                                            >
                                                {p.qtd_ocorrencias_produto}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
                <Button onClick={onClose} variant="outlined" sx={{ minWidth: 100, fontWeight: 500 }}>
                    Fechar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProdutosOcorrenciaModal;
