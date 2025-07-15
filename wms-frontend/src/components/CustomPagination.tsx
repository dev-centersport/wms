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
} from '@mui/material';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

interface CustomPaginationProps {
  totalPages: number;
  currentPage: number;
  show?: boolean;
  onPageChange: (page: number) => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  totalPages = 1,
  currentPage = 1,
  show = true,
  onPageChange,
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
    <Box
      sx={{
        display: (show) ? "block" : "none",
        position: 'sticky',
        bottom: 0,
        backgroundColor: 'background.paper',
        zIndex: 1,
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

      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            type="number"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value)}
            inputProps={{
              min: 1,
              max: totalPages,
            }}
            sx={{ width: 80 }}
            placeholder={`1-${totalPages}`}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleGoToPage}
            disabled={!pageInput}
          >
            Ir
          </Button>
        </Box>
      </Popover>
    </Box>
  );
};

export default CustomPagination;