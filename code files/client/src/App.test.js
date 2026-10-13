import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';

test('renders App without crashing', () => {
  const div = document.createElement('div');
  const root = ReactDOM.createRoot(div);
  root.render(
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );
  root.unmount();
});
