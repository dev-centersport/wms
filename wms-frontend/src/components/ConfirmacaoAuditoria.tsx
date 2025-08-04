import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  IconButton,
  Box,
  Button
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface ConfirmacaoAuditoriaProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mensagem: string;
}

const ConfirmacaoAuditoria: React.FC<ConfirmacaoAuditoriaProps> = ({
  open,
  onClose,
  onConfirm,
  mensagem,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: '2px solid #61de27',
          overflow: 'hidden',
          boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <Box
        sx={{
          backgroundColor: '#61de27',
          px: 2,
          py: 1.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography sx={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>
          Confirmação
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Typography sx={{ fontSize: 22, fontWeight: 'bold', color: '#000' }}>×</Typography>
        </IconButton>
      </Box>

      <DialogContent
        sx={{
          textAlign: 'center',
          py: 5,
          backgroundColor: '#fff',
        }}
      >
        <WarningAmberIcon sx={{ fontSize: 56, color: '#000', mb: 2 }} />
        <Typography sx={{ fontSize: 17, fontWeight: 500, color: '#333' }}>
          {mensagem}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
        <Button
          onClick={onConfirm}
          sx={{
            backgroundColor: '#61de27',
            color: '#000',
            fontWeight: 'bold',
            fontSize: 16,
            textTransform: 'none',
            px: 6,
            py: 1.7,
            borderRadius: '10px',
            boxShadow: '0 6px 12px rgba(97, 222, 39, 0.4)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              backgroundColor: '#4ec51f',
              transform: 'scale(1.03)',
              boxShadow: '0 8px 16px rgba(78, 197, 31, 0.5)',
            },
          }}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmacaoAuditoria;
