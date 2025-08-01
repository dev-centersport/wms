import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import CustomPagination from './CustomPagination';


interface LayoutProps {
  children: React.ReactNode;
  totalPages?: number;
  currentPage?: number;
  show?: boolean;
  onPageChange?: (page: number) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (size: number) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  totalPages = 1,
  currentPage = 1,
  show = true,
  onPageChange = () => {},
  itemsPerPage = 50,
  onItemsPerPageChange,
}) => {
  return (
    <Sidebar>
      <Box sx={{ 
        display: 'flex', 
        minHeight: '100vh', 
        flexDirection: 'column',
        position: 'relative'
      }}>
        <Box sx={{ 
          flex: 1, 
          p: 3,
          overflow: 'auto'
        }}>
          {children}
        </Box>

        <CustomPagination
          show={show}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={onPageChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      </Box>
    </Sidebar>
  );
};

export default Layout;
