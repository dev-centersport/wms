// src/components/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton, // ⬅️ substitui ListItem
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/BarChart';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import InventoryIcon from '@mui/icons-material/Inventory2';
import RoomIcon from '@mui/icons-material/Room';
import MapIcon from '@mui/icons-material/Map';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import SearchIcon from '@mui/icons-material/Search';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import SecurityIcon from '@mui/icons-material/Security';


const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { label: 'Armazém', icon: <WarehouseIcon />, path: '/armazem' },
    { label: 'Produto', icon: <InventoryIcon />, path: '/produto' },
    { label: 'Localização', icon: <RoomIcon />, path: '/localizacao' },
    { label: 'Tipo de Localização', icon: <MapIcon />, path: '/tipo-localizacao' },
    { label: 'Movimentação', icon: <CompareArrowsIcon />, path: '/movimentacao' },
    { label: 'Consulta', icon: <SearchIcon />, path: '/consulta' },
    { label: 'Separação', icon: <LocalShippingIcon />, path: '/separacao' },
    { label: 'Ocorrências', icon: <ReportProblemIcon />, path: '/ocorrencias' },
    { label: 'Auditoria', icon: <SecurityIcon />, path: '/auditoria' },
  ];

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: '#59e60d',
        },
      }}
      className="sidebar"
    >
      {/* Logo */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <Box
          component="img"
          
          alt="Logo CenterSport"
          sx={{ width: '80%', maxWidth: 140 }}
        />
      </Box>

      {/* Itens de menu */}
      <List>
        {menuItems.map(({ label, icon, path }) => {
          const isActive = location.pathname.startsWith(path);
          return (
            <ListItemButton
              key={path}
              component={Link}
              to={path}
              selected={isActive}
            >
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={`${label}${isActive ? ' ●' : ''}`} />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;
