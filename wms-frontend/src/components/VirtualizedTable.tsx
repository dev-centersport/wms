import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from '@mui/material';

interface VirtualizedTableProps<T> {
  data: T[];
  rowHeight?: number;
  visibleRows?: number;
  renderRow: (item: T, index: number) => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  getItemKey: (item: T, index: number) => string | number;
}

function VirtualizedTable<T>({
  data,
  rowHeight = 52,
  visibleRows = 15,
  renderRow,
  renderHeader,
  getItemKey,
}: VirtualizedTableProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalHeight = data.length * rowHeight;
  const visibleHeight = visibleRows * rowHeight;

  const startIndex = Math.floor(scrollTop / rowHeight);
  const endIndex = Math.min(startIndex + visibleRows + 1, data.length);

  const visibleData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);

  const offsetY = startIndex * rowHeight;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <TableContainer
      component={Paper}
      ref={containerRef}
      sx={{
        height: visibleHeight,
        overflow: 'auto',
        borderRadius: 2,
      }}
    >
      <Table stickyHeader>
        {renderHeader && <TableHead>{renderHeader()}</TableHead>}
        <TableBody>
          <Box
            component="tr"
            sx={{
              height: offsetY,
              display: 'block',
            }}
          />
          {visibleData.map((item, index) => (
            <React.Fragment key={getItemKey(item, startIndex + index)}>
              {renderRow(item, startIndex + index)}
            </React.Fragment>
          ))}
          <Box
            component="tr"
            sx={{
              height: totalHeight - (endIndex * rowHeight),
              display: 'block',
            }}
          />
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default VirtualizedTable; 