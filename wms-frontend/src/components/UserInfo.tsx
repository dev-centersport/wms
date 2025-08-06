import React from 'react';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const UserInfo: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 2,
        borderTop: '1px solid rgba(255,255,255,0.1)',
        mt: 'auto',
      }}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          mb: 1,
          bgcolor: 'rgba(255,255,255,0.2)',
          color: '#fff',
          fontSize: '1rem',
          fontWeight: 'bold',
        }}
      >
        {user.responsavel.charAt(0).toUpperCase()}
      </Avatar>
      
      <Typography
        variant="body2"
        sx={{
          color: '#fff',
          fontWeight: 500,
          textAlign: 'center',
          mb: 0.5,
          fontSize: '0.875rem',
        }}
      >
        {user.responsavel}
      </Typography>
      
      <Chip
        label={user.perfil}
        size="small"
        sx={{
          bgcolor: 'rgba(255,255,255,0.2)',
          color: '#fff',
          fontSize: '0.75rem',
          height: 20,
        }}
      />
      
      <Typography
        variant="caption"
        sx={{
          color: 'rgba(255,255,255,0.7)',
          fontSize: '0.7rem',
          mt: 0.5,
        }}
      >
        {user.usuario}
      </Typography>
    </Box>
  );
};

export default UserInfo; 