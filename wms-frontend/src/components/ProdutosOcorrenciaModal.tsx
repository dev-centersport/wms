import React, { useEffect, useState } from 'react';
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
  CircularProgress,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ProdutoOcorrencia {
  ocorrencia_id: number;
  produto_id: number;
  descricao: string;
  sku: string;
  ean: string;
  qtd_sistema: number;
  qtd_esperada: number;
  diferenca: number;
}

interface ProdutosOcorrenciaModalProps {
  open: boolean;
  onClose: () => void;
  ocorrenciaId: number;
  ocorrenciaNome: string;
}

const ProdutosOcorrenciaModal: React.FC<ProdutosOcorrenciaModalProps> = ({
  open,
  onClose,
  ocorrenciaId,
  ocorrenciaNome
}) => {
  const [produtos, setProdutos] = useState<ProdutoOcorrencia[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (open && ocorrenciaId) {
      carregarProdutos();
    }
  }, [open, ocorrenciaId]);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      setErro(null);
      const data = await buscarProdutosDaOcorrencia(ocorrenciaId);
      setProdutos(data);
    } catch (err) {
      console.error('Erro ao buscar produtos da ocorrência:', err);
      setErro('Não foi possível carregar os produtos da ocorrência.');
    } finally {
      setLoading(false);
    }
  };

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
        <Typography variant="h6" fontWeight={600}>
          Produtos na Ocorrência {ocorrenciaNome}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress size={40} />
          </Box>
        ) : erro ? (
          <Box p={3} textAlign="center">
            <Typography color="error">{erro}</Typography>
          </Box>
        ) : produtos.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography color="text.secondary">Nenhum produto encontrado para esta ocorrência.</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Descrição</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>EAN</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Qtd. Sistema</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Qtd. Gaveta</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Diferença</TableCell>
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
                      <Typography fontWeight={600} color={p.diferenca !== 0 ? 'error' : 'success.main'}>
                        {p.diferenca}
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
