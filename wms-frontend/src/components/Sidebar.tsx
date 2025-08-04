import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import image from '../img/image.png';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SearchIcon from '@mui/icons-material/Search';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HomeIcon from '@mui/icons-material/Home';
import RoomIcon from '@mui/icons-material/Room';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import TrolleyIcon from '@mui/icons-material/Trolley';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SecurityIcon from '@mui/icons-material/Security';
import AnalyticsIcon from '@mui/icons-material/Analytics';

const menuItems = [
  { label: 'Dashboard', icon: <AnalyticsIcon />, path: '/dashboard' },
  { label: 'Armazém', icon: <HomeIcon />, path: '/armazem' },
  { label: 'Localização', icon: <RoomIcon />, path: '/localizacao' },
  { label: 'Tipo de Localização', icon: <AssignmentIcon />, path: '/tipo-localizacao' },
  { label: 'Produto', icon: <ViewInArIcon />, path: '/produto' },
  { label: 'Consulta', icon: <SearchIcon />, path: '/consulta' },
  { label: 'Movimentação', icon: <TrolleyIcon />, path: '/movimentacao' },
  { label: 'Separação', icon: <LocalShippingIcon />, path: '/separacao' },
  { label: 'Ocorrência', icon: <ReportProblemIcon />, path: '/ocorrencias' },
  { label: 'Auditoria', icon: <ThumbUpIcon />, path: '/auditoria' },
  { label: 'Relatorio', icon: <AssignmentIcon />, path: '/Relatorio' },
  { label: 'Usuários', icon: <PeopleAltIcon />, path: '/Usuarios' },
  { label: 'Perfis', icon: <SecurityIcon />, path: '/perfil-usuario' },
];

const SIDEBAR_WIDTH = 210;

interface SidebarProps {
  children: React.ReactNode;
  gavetaAberta?: boolean; // ADICIONADO: se true, bloqueia navegação
}

const Sidebar: React.FC<SidebarProps> = ({ children, gavetaAberta = false }) => {
  const currentLocation = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fechar menu mobile quando navegar
  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [currentLocation.pathname, isMobile]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          mt: 2,
          mb: 3,
          px: 0,
          userSelect: 'none',
        }}
      >
        <Box
          component="img"
          src={image}
          alt="Logo"
          sx={{
            width: 130,
            height: 110,
            mb: 1,
          }}
        />
      </Box>
      <List
        disablePadding
        sx={{
          width: '100%',
          flexGrow: 1,
        }}
      >
        {menuItems.map(({ label, icon, path }) => {
          const isActive =
            currentLocation.pathname === path ||
            currentLocation.pathname.startsWith(path + '/');
          // Bloquear todos EXCETO a página Movimentação quando gaveta estiver aberta
          const isMovimentacao = path === '/movimentacao';
          const disabled = gavetaAberta && !isActive && !isMovimentacao;
          return (
            <Tooltip
              title={
                disabled
                  ? 'Finalize ou cancele a movimentação antes de navegar.'
                  : ''
              }
              arrow
              key={path}
              placement="right"
            >
              <span style={{ display: 'block' }}>
                <ListItemButton
                  key={path}
                  component={Link}
                  to={path}
                  selected={isActive}
                  disabled={disabled}
                  sx={{
                    mx: 2,
                    my: 0.5,
                    borderRadius: 2,
                    px: 2,
                    py: 1.2,
                    minHeight: 48,
                    alignItems: 'center',
                    boxShadow: isActive ? '0 2px 12px #1111' : 'none',
                    background: isActive ? 'rgba(255,255,255,0.98)' : 'transparent',
                    fontWeight: isActive ? 'bold' : 500,
                    color: isActive ? '#222' : '#1d4a09',
                    opacity: disabled ? 0.46 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    '& .MuiListItemIcon-root': {
                      color: isActive ? '#0e9200' : '#0b3d11',
                    },
                    '&:hover': disabled
                      ? { background: 'rgba(255,255,255,0.98)' }
                      : { background: 'rgba(255,255,255,0.89)', color: '#198700' },
                    transition: 'background 0.15s, box-shadow 0.22s',
                    position: 'relative',
                  }}
                >
                  {isActive && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 4,
                        top: 10,
                        bottom: 10,
                        width: 4,
                        borderRadius: 2,
                        background: 'linear-gradient(180deg,#198700 0%,#68ea34 100%)',
                        boxShadow: '0 0 4px #0b0b0b22',
                      }}
                    />
                  )}
                  <ListItemIcon sx={{ minWidth: 32, mr: 1 }}>{icon}</ListItemIcon>
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{
                      sx: {
                        fontSize: 13.2,
                        fontWeight: isActive ? 700 : 500,
                        letterSpacing: '0.03em',
                        textTransform: 'none',
                      },
                    }}
                  />
                </ListItemButton>
              </span>
            </Tooltip>
          );
        })}
      </List>
      <Box sx={{ height: 32 }} />
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Botão de toggle para mobile */}
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="abrir menu"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1300,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            },
          }}
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
      )}

      {/* Drawer para desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          anchor="left"
          PaperProps={{
            sx: {
              width: SIDEBAR_WIDTH,
              background: 'linear-gradient(hsl(101, 74.00%, 50.30%))',
              color: '#111',
              borderRight: 'none',
              boxShadow: '4px 0 16px -4px #0001',
              zIndex: 1200,
              overflow: 'hidden',
              borderTopRightRadius: 20,
              borderBottomRightRadius: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'center',
              position: 'fixed',
              top: 0,
              left: 0,
              height: '100vh',
              transition: 'box-shadow 0.2s',
              paddingX: 0,
              paddingTop: 0,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Drawer para mobile */}
      {isMobile && (
        <Drawer
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Melhora performance em dispositivos móveis
          }}
          PaperProps={{
            sx: {
              width: SIDEBAR_WIDTH,
              background: 'linear-gradient(hsl(101, 74.00%, 50.30%))',
              color: '#111',
              borderRight: 'none',
              boxShadow: '4px 0 16px -4px #0001',
              zIndex: 1200,
              overflow: 'hidden',
              borderTopRightRadius: 20,
              borderBottomRightRadius: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'center',
              height: '100vh',
              transition: 'box-shadow 0.2s',
              paddingX: 0,
              paddingTop: 0,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Conteúdo principal */}
      <Box
        component="main"
        sx={{
          marginLeft: isMobile ? 0 : `${SIDEBAR_WIDTH}px`,
          width: isMobile ? '100vw' : `calc(100vw - ${SIDEBAR_WIDTH}px)`,
          minHeight: '100vh',
          background: '#fafbfd',
          display: 'flex',
          flexDirection: 'column',
          transition: 'margin-left 0.3s ease-in-out',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Sidebar;
