import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0f8d4e', // Verde CenterSport
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
      main: '#43a047',
    },
    background: {
      default: '#f9f9f9',
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
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
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#e8f5ee',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#f0f0f0',
          },
        },
      },
    },
  },
});

export default theme;
