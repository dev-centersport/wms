import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import CustomPagination from './CustomPagination';


interface LayoutProps {
  children: React.ReactNode;
  totalPages?: number;
  currentPage?: number;
  show?: boolean;
  onPageChange?: (page: number) => void; // Tornado opcional
  itemsPerPage?: number;
  onItemsPerPageChange?: (size: number) => void;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  totalPages = 1,
  currentPage = 1,
  show = true,
  onPageChange = () => {}, // Função vazia como padrão
  itemsPerPage = 50,
  onItemsPerPageChange,
}) => {
  // const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  // const [pageInput, setPageInput] = useState('');

  // const popoverOpen = Boolean(anchorEl);

  // const handleOpenPopover = (event: React.MouseEvent<HTMLElement>) => {
  //   setAnchorEl(event.currentTarget);
  //   setPageInput('');
  // };

  // const handleClosePopover = () => setAnchorEl(null);

  // const handleGoToPage = () => {
  //   const pageNum = Number(pageInput);
  //   if (pageNum >= 1 && pageNum <= totalPages) {
  //     onPageChange(pageNum);
  //   }
  //   handleClosePopover();
  // };

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
          onItemsPerPageChange={onItemsPerPageChange} // Passando a função para atualizar
        />
      </Box>
    </Sidebar>
  );
};

export default Layout;
