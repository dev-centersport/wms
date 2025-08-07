import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Person,
  Settings,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    if (window.confirm('Deseja realmente sair do sistema?')) {
      await logout();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box
      sx={{
        backgroundColor: '#61DE25',
        width: '100%',
        minHeight: 80,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '12px 16px' : '16px 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 1000,
      }}
    >
      {/* Logo e Título */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          component="img"
          src="/logo192.png"
          alt="WMS Logo"
          sx={{
            width: isMobile ? 40 : 50,
            height: isMobile ? 40 : 50,
            borderRadius: '8px',
          }}
        />
        {title && (
          <Typography
            variant={isMobile ? 'h6' : 'h5'}
            sx={{
              fontWeight: 'bold',
              color: '#000',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            {title}
          </Typography>
        )}
      </Box>

      {/* Informações do Usuário e Menu */}
      {user && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Informações do usuário - visível apenas em desktop */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 0.5,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'bold',
                color: '#000',
                fontSize: '0.875rem',
              }}
            >
              {user.usuario}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: '#000',
                fontSize: '0.75rem',
                opacity: 0.8,
              }}
            >
              {user.perfil}
            </Typography>
          </Box>

          {/* Avatar e Menu */}
          <Tooltip title="Menu do usuário">
            <IconButton
              onClick={handleMenuClick}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              <Avatar
                sx={{
                  width: isMobile ? 32 : 36,
                  height: isMobile ? 32 : 36,
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  color: '#000',
                  fontWeight: 'bold',
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                }}
              >
                {getInitials(user.usuario)}
              </Avatar>
            </IconButton>
          </Tooltip>

          {/* Menu Dropdown */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                borderRadius: 2,
              },
            }}
          >
            {/* Informações do usuário no menu mobile */}
            {isMobile && (
              <>
                <MenuItem disabled sx={{ opacity: 1 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000' }}>
                      {user.usuario}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {user.perfil}
                    </Typography>
                  </Box>
                </MenuItem>
                <Divider />
              </>
            )}

            <MenuItem onClick={handleMenuClose} sx={{ gap: 2 }}>
              <Person fontSize="small" />
              <Typography variant="body2">Meu Perfil</Typography>
            </MenuItem>

            <MenuItem onClick={handleMenuClose} sx={{ gap: 2 }}>
              <Settings fontSize="small" />
              <Typography variant="body2">Configurações</Typography>
            </MenuItem>

            <Divider />

            <MenuItem
              onClick={handleLogout}
              sx={{
                gap: 2,
                color: '#d32f2f',
                '&:hover': {
                  backgroundColor: '#ffebee',
                },
              }}
            >
              <Logout fontSize="small" />
              <Typography variant="body2">Sair</Typography>
            </MenuItem>
          </Menu>
        </Box>
      )}
    </Box>
  );
};

export default Header;
