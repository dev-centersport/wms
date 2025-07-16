import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import image from '../img/image.png'
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';

import SpeedIcon from '@mui/icons-material/Speed';
import HomeIcon from '@mui/icons-material/Home';
import RoomIcon from '@mui/icons-material/Room';

import SearchIcon from '@mui/icons-material/Search';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import WidgetsIcon from '@mui/icons-material/Widgets';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PersonIcon from '@mui/icons-material/Person';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import BalanceIcon from '@mui/icons-material/Balance';
import QueryStatsIcon from '@mui/icons-material/QueryStats';

const menuItems = [
  // { label: 'Dashboard',           icon: <SpeedIcon />,         path: '/dashboard' },
  { label: 'Armazém',             icon: <HomeIcon />,          path: '/armazem' },
  { label: 'Localização',         icon: <RoomIcon />,          path: '/localizacao' },
  { label: 'Tipo de Localização', icon: <SpeedIcon />,      path: '/tipo-localizacao' }, // ⬅️ Novo item
  // { label: 'Produto',             icon: <InventoryIcon />,     path: '/produto' },
  // { label: 'Consulta',            icon: <SearchIcon />,        path: '/consulta' },
  // { label: 'Movimentação',        icon: <WorkspacesIcon />,    path: '/movimentacao' },
  // { label: 'Ocorrência',          icon: <ReportProblemIcon />, path: '/ocorrencias' },
  // { label: 'Auditoria',           icon: <ThumbUpIcon />,       path: '/auditoria' },
];
// ✅ Adicione essa interface
interface SidebarProps {
  children: React.ReactNode;
}

// ✅ Atualize para aceitar children
const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: 200,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
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

        <List disablePadding>
          {menuItems.map(({ label, icon, path }) => {
            const isActive = location.pathname.startsWith(path);
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
      </Drawer>

      {/* ✅ Aqui o conteúdo principal da página */}
      <Box component="main" width="100%">
        {children}
      </Box>
    </Box>
  );
};

export default Sidebar;
