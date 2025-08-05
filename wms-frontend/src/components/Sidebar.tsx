import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import image from '../img/image.png';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Divider,
} from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SearchIcon from '@mui/icons-material/Search';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SpeedIcon from '@mui/icons-material/Speed';
import HomeIcon from '@mui/icons-material/Home';
import RoomIcon from '@mui/icons-material/Room';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import TrolleyIcon from '@mui/icons-material/Trolley';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';

const menuItems = [
  // { label: 'Dashboard',           icon: <SpeedIcon />,         path: '/dashboard' },
  { label: 'Armazém', icon: <HomeIcon />, path: '/armazem' },
  { label: 'Localização', icon: <RoomIcon />, path: '/localizacao' },
  { label: 'Tipo de Localização', icon: <AssignmentIcon />, path: '/tipo-localizacao' },
  { label: 'Produto', icon: <ViewInArIcon />, path: '/produto' },
  { label: 'Consulta', icon: <SearchIcon />, path: '/consulta' },
  { label: 'Movimentação', icon: <TrolleyIcon />, path: '/movimentacao' },
  // { label: 'Separação', icon: <LocalShippingIcon />, path: '/separacao' },
  // { label: 'Ocorrência', icon: <ReportProblemIcon />, path: '/ocorrencias' },
  // { label: 'Auditoria', icon: <ThumbUpIcon />, path: '/auditoria' },
  // { label: 'Relatorio', icon: <AssignmentIcon />, path: '/Relatorio' },
  // { label: 'Usuários', icon: <PeopleAltIcon />, path: '/Usuarios' }
];

interface SidebarProps {
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (window.confirm('Deseja realmente sair do sistema?')) {
      await logout();
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: 200,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
            width: 200,
            backgroundColor: '#61de27',
            boxSizing: 'border-box',
            paddingTop: 2,
            borderRight: 'none',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Box
            component="img"
            src={image}
            alt="Logo"
            sx={{ width: 170, height: 140, marginTop: 2 }}
          />
        </Box>

        {/* Informações do usuário */}
        {user && (
          <Box sx={{ px: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000' }}>
              Usuário: {user.usuario}
            </Typography>
            <Typography variant="caption" sx={{ color: '#000' }}>
              Perfil: {user.perfil}
            </Typography>
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />

        <List disablePadding>
          {menuItems.map(({ label, icon, path }) => {
            // Considera ativo se o início da rota bate com o path
            const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
            return (
              <ListItemButton
                key={path}
                component={Link}
                to={path}
                selected={isActive}
                sx={{
                  px: 3,
                  py: 1,
                  position: 'relative',
                  '&.Mui-selected::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 2,
                    backgroundColor: '#000',
                    borderTopRightRadius: 4,
                    borderBottomRightRadius: 4,
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'transparent',
                    fontWeight: 'bold',
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(238, 0, 0, 0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32, color: '#000' }}>{icon}</ListItemIcon>
                <ListItemText
                  primary={label}
                  primaryTypographyProps={{ sx: { color: '#000', fontSize: 14 } }}
                />
              </ListItemButton>
            );
          })}
        </List>

        {/* Botão de Logout */}
        <Box sx={{ mt: 'auto', p: 2 }}>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            fullWidth
            sx={{
              color: '#000',
              borderColor: '#000',
              '&:hover': {
                borderColor: '#000',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            Sair
          </Button>
        </Box>
      </Drawer>

      <Box component="main" width="100%">
        {children}
      </Box>
    </Box>
  );
};

export default Sidebar;
