// src/main.jsx (or src/index.jsx)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

// Define your theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#6200EE', // Indigo
    },
    secondary: {
      main: '#03DAC6', // Teal
    },
    background: {
      default: '#F5F5F5', // Light Gray
    },
    text: {
      primary: '#212121', // Dark Gray
    },
  },
  typography: {
    // Customize typography as needed
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
