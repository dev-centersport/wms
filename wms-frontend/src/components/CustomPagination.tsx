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
  MenuItem,
  Select,
  Typography,
  Stack,
} from '@mui/material';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

interface CustomPaginationProps {
  totalPages: number;
  currentPage: number;
  show?: boolean;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  totalPages = 1,
  currentPage = 1,
  show = true,
  itemsPerPage = 100,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [pageInput, setPageInput] = useState('');
  const pageSizeOptions = [50, 100, 200, 500];

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

  const handleItemsPerPageChange = (e: any) => {
    const newSize = Number(e.target.value);
    if (onItemsPerPageChange) {
      onItemsPerPageChange(newSize);
    }
    // Reset to first page when changing page size
    onPageChange(1);
  };

  return (
    <Box
      sx={{
        display: show ? "block" : "none",
        position: 'sticky',
        bottom: 0,
        backgroundColor: 'background.paper',
        zIndex: 1,
        borderTop: '1px solid',
        borderColor: 'divider',
        py: 1,
      }}
    >
      {/* <Divider /> */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {/* Paginação */}
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={(_, page) => onPageChange && onPageChange(page)}
          siblingCount={1}
          boundaryCount={1}
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

        {/* Seletor de itens por página */}
        <Box marginRight={2} sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            Itens por página:
          </Typography>
          <Select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            size="small"
            sx={{
              height: 36,
              '& .MuiSelect-select': {
                py: 1,
              },
            }}
          >
            {pageSizeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Stack>

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