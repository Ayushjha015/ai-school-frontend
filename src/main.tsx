import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { setupApiInterceptors } from './api/setupInterceptors';
import { ThemedToaster } from './components/common/ThemedToaster';
import { ThemeProvider } from './theme/ThemeProvider';
import { queryClient } from './utils/queryClient';
import './index.css';

setupApiInterceptors(queryClient);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
          <ThemedToaster />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
