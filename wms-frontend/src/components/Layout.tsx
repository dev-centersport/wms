<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import React, { useState } from 'react';
import {
  Box,
  Divider,
  IconButton,
  Pagination,
  PaginationItem,
  Popover,
  TextField,
  Button,
  Container,
  Typography,
} from '@mui/material';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
=======
import React from 'react';
import { Box } from '@mui/material';
>>>>>>> parent of d8ec4f5 (Merge pull request #16 from dev-centersport/estilizacao)
=======
import React from 'react';
import { Box } from '@mui/material';
>>>>>>> parent of d8ec4f5 (Merge pull request #16 from dev-centersport/estilizacao)
=======
import React from 'react';
import { Box } from '@mui/material';
>>>>>>> parent of d8ec4f5 (Merge pull request #16 from dev-centersport/estilizacao)
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  pageTitle?: string; // Nova prop para o título da página
}

const Layout: React.FC<LayoutProps> = ({
  children,
  totalPages = 1,
  currentPage = 1,
  onPageChange = () => {},
  pageTitle = "Tema da página", // Valor padrão
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

=======
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
>>>>>>> parent of d8ec4f5 (Merge pull request #16 from dev-centersport/estilizacao)
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
<<<<<<< HEAD
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Container maxWidth="xl" sx={{ marginLeft: '10px' }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
              {pageTitle} {/* Usando a prop aqui */}
            </Typography>
              {children}
          </Container>
        </Box>

        {/* Restante do código permanece igual */}
        {totalPages > 1 && (
          <>
            <Divider />
            <Box
              
              sx={{
                marginY: 3
              }}
            >
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

              <Popover
                open={popoverOpen}
                anchorEl={anchorEl}
                onClose={handleClosePopover}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              >
                <Box p={2} display="flex" alignItems="center" gap={1}>
                  <TextField
                    label="Página"
                    type="number"
                    size="small"
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    InputProps={{ inputProps: { min: 1, max: totalPages } }}
                    sx={{ width: 100 }}
                  />
                  <Button variant="contained" onClick={handleGoToPage}>
                    Ir
                  </Button>
                </Box>
              </Popover>
            </Box>
          </>
        )}
=======
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
>>>>>>> parent of d8ec4f5 (Merge pull request #16 from dev-centersport/estilizacao)
=======
}

=======
}

>>>>>>> parent of d8ec4f5 (Merge pull request #16 from dev-centersport/estilizacao)
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
<<<<<<< HEAD
>>>>>>> parent of d8ec4f5 (Merge pull request #16 from dev-centersport/estilizacao)
=======
>>>>>>> parent of d8ec4f5 (Merge pull request #16 from dev-centersport/estilizacao)
      </Box>
    </Box>
  );
};

export default Layout;