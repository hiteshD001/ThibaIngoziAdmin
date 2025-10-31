// import React from 'react';
import ReactDOM from 'react-dom/client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ToastContainer } from 'react-toastify'

import App from './App.jsx'
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Provider } from 'react-redux';
import store from './Redux Store/Store.jsx';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import { WebSocketProvider } from './API Calls/WebSocketContext.jsx';

const client = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <Provider store={store}>
    <WebSocketProvider>
      <QueryClientProvider client={client}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <ToastContainer />
            <App />
          </LocalizationProvider>
        </ThemeProvider>
      </QueryClientProvider>

    </WebSocketProvider>
  </Provider>
  // </React.StrictMode>,
)