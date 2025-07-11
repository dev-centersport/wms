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


interface LayoutProps {
  children: React.ReactNode;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  totalPages = 1,
  currentPage = 1,
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
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'background.paper', // Cor de fundo para sobrepor conteúdo
            zIndex: 1, // Garante que fique acima do conteúdo
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Divider />
          <Pagination
            count={totalPages}
            page={currentPage}
            siblingCount={1}
            boundaryCount={1}
            onChange={(_, page) => onPageChange(page)}
            renderItem={(item) => {
              if (item.type === 'next') {
                return <PaginationItem {...item} components={{ next: ArrowRightAltIcon }} />;
              }
              if (item.type === 'previous') {
                return null;
              }
              if (item.type === 'start-ellipsis' || item.type === 'end-ellipsis') {
                return (
                  <IconButton onClick={handleOpenPopover}>
                    <MoreHorizIcon />
                  </IconButton>
                );
              }
              return (
                <PaginationItem
                  {...item}
                  sx={{
                    fontWeight: item.page === currentPage ? 'bold' : 'normal',
                    fontFamily: 'monospace',
                    fontSize: 14,
                    borderRadius: 0,
                    minWidth: 36,
                    height: 36,
                    mx: 0.5,
                  }}
                />
              );
            }}
          />
          {/* ... Popover mantido igual ... */}
        </Box>
      </Box>
    </Sidebar>
  );
};

export default Layout;
