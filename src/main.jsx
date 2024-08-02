import React from 'react';
import ReactDOM from 'react-dom/client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ToastContainer } from 'react-toastify'

import App from './App.jsx'

import { Provider } from 'react-redux';
import store from './Redux Store/Store.jsx';

import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'

const client = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <ToastContainer />
        <App />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>,
)