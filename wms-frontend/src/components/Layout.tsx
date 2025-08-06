import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

interface LayoutProps {
  children?: React.ReactNode;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  show?: boolean;
  itemsPerPage?: number;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  totalPages, 
  currentPage, 
  onPageChange, 
  show = true,
  itemsPerPage,
  onItemsPerPageChange
}) => {
  return (
    <Sidebar 
      totalPages={totalPages}
      currentPage={currentPage}
      onPageChange={onPageChange}
      show={show}
      itemsPerPage={itemsPerPage}
      onItemsPerPageChange={onItemsPerPageChange}
    >
      {children || <Outlet />}
    </Sidebar>
  );
};

export default Layout;
