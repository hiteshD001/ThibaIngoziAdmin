import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify'
import 'bootstrap/dist/css/bootstrap.min.css';

const client = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <ToastContainer />
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)