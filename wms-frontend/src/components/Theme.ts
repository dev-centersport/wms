import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#61de27', // Verde CenterSport
      contrastText: '#fff',
    },
    secondary: {
      main: '#1e1e1e', // Cinza-escuro padrão
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#f9a825',
    },
    success: {
      main: '#61de27', // Usando o verde principal
    },
    background: {
      default: '#f9f9f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e1e1e',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
    h4: {
      fontWeight: 600,
      color: '#1e1e1e',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '8px 20px',
          borderRadius: 8,
        },
        contained: {
          backgroundColor: '#61de27',
          color: '#000',
          fontWeight: 'bold',
          '&:hover': {
            backgroundColor: '#48c307',
          },
        },
        outlined: {
          borderColor: '#000',
          color: '#000',
          '&:hover': {
            backgroundColor: 'rgba(97, 222, 39, 0.1)',
            borderColor: '#48c307',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#61de27',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#61de27',
            },
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#e8f5ee',
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: '#1e1e1e',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f0f0f0',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(97, 222, 39, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(97, 222, 39, 0.15)',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #e0e0e0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(97, 222, 39, 0.1)',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#61de27',
          '&.Mui-checked': {
            color: '#61de27',
          },
        },
      },
    },
  },
});

export default theme;
