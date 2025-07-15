import React, { useState, useEffect } from 'react';
import {
  Box,
  Divider,
  IconButton,
  Pagination,
  PaginationItem,
  Popover,
  TextField,
  Button,
} from '@mui/material';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import Sidebar from './Sidebar';
import CustomPagination from './CustomPagination';


interface LayoutProps {
  children: React.ReactNode;
  totalPages?: number;
  currentPage?: number;
  show?: boolean;
  onPageChange?: (page: number) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  totalPages = 1,
  currentPage = 1,
  show = true,
  onPageChange = () => { },
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [pageInput, setPageInput] = useState('');

  const popoverOpen = Boolean(anchorEl);

  const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setPageInput('');
  };

  const handleClosePopover = () => setAnchorEl(null);

  const handleGoToPage = () => {
    const pageNum = Number(pageInput);
    if (pageNum >= 1 && pageNum <= totalPages) {
      onPageChange(pageNum);
    }
    handleClosePopover();
  };

  return (
    <Sidebar>
      <Box sx={{ 
        display: 'flex', 
        minHeight: '100vh', 
        flexDirection: 'column', // Mude de 'row' para 'column'
        position: 'relative' // Adicione isso
      }}>
        {/* Conteúdo principal - agora em um container flexível */}
        <Box sx={{ 
          flex: 1, 
          p: 3,
          overflow: 'auto' // Permite rolagem do conteúdo
        }}>
          {children}
        </Box>

        {/* Footer/Pagination - agora sticky */}
        <CustomPagination
          show={show}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={onPageChange}
        />
      </Box>
    </Sidebar>
  );
};

export default Layout;
