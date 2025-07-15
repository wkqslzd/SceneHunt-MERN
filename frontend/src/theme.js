// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#121212',
    },
    secondary: {
      main: '#f5c518', // Yellow theme color, similar to IMDb
    },
    error: {
      main: '#e50914', // Red, similar to Netflix
    },
  },
  typography: {
    fontFamily: 'Arial, sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 'bold',
        },
      },
    },
  },
});

export default theme;