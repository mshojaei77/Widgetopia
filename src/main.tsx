import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, CssBaseline } from '@mui/material'; // Import MUI components
import App from './App';
import theme from './theme'; // Import the custom theme
import './index.css'; // Keep index.css for root variables if still needed, or remove if fully MUI

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}> { /* Apply the theme */ }
      <CssBaseline /> { /* Apply baseline styles and custom body background */ }
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);