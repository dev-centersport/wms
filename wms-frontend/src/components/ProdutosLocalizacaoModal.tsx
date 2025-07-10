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
import { buscarProdutosPorLocalizacao } from '../services/API';

interface Produto {
  produto_id: number;
  descricao: string;
  sku: string;
  ean: string;
  quantidade: number;
}

interface ProdutosLocalizacaoModalProps {
  open: boolean;
  onClose: () => void;
  localizacaoId: number;
  localizacaoNome: string;
  onQuantidadeAtualizada?: () => void;
}

const ProdutosLocalizacaoModal: React.FC<ProdutosLocalizacaoModalProps> = ({
  open,
  onClose,
  localizacaoId,
  localizacaoNome,
  onQuantidadeAtualizada
}) => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantidadeTotal, setQuantidadeTotal] = useState(0);

  useEffect(() => {
    if (open && localizacaoId) {
      carregarProdutos();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, localizacaoId]);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await buscarProdutosPorLocalizacao(localizacaoId);
      setProdutos(data);
      
      // Calcular quantidade total
      const total = data.reduce((sum: number, item: Produto) => sum + (item.quantidade || 0), 0);
      setQuantidadeTotal(total);
      
      // Opcional: Atualizar a quantidade total na tabela principal
      if (onQuantidadeAtualizada) {
        onQuantidadeAtualizada();
      }
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
      setError('Não foi possível carregar os produtos desta localização.');
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
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: '#f5f5f5', 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Produtos em {localizacaoNome}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : produtos.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Nenhum produto encontrado nesta localização.
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ 
              p: 2, 
              backgroundColor: '#f9f9f9', 
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <Typography variant="subtitle1">
                <strong>{produtos.length}</strong> {produtos.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </Typography>
              <Typography variant="subtitle1">
                Quantidade total: <strong style={{ color: '#59e60d' }}>{quantidadeTotal}</strong>
              </Typography>
            </Box>
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Descrição</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>EAN</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Quantidade</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {produtos.map((produto) => (
                    <TableRow key={produto.produto_id} hover>
                      <TableCell>{produto.descricao}</TableCell>
                      <TableCell>{produto.sku}</TableCell>
                      <TableCell>{produto.ean}</TableCell>
                      <TableCell align="center">
                        <Typography 
                          sx={{ 
                            fontWeight: 600, 
                            color: produto.quantidade > 0 ? '#59e60d' : '#ff3d00'
                          }}
                        >
                          {produto.quantidade}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ 
            minWidth: 100,
            fontWeight: 500
          }}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProdutosLocalizacaoModal;