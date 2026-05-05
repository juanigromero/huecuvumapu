import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import { setCredentials, logout } from './store/authSlice';
import { supabase } from './lib/supabase';
import App from './App.jsx';
import './index.css';

// Supabase maneja el refresh del token automáticamente.
// Cada vez que cambia la sesión (login, logout, refresh), sincronizamos Redux.
supabase.auth.onAuthStateChange(async (_event, session) => {
  if (session) {
    // Obtener el perfil del usuario de nuestra tabla
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', session.user.id)
      .single();

    store.dispatch(setCredentials({
      token: session.access_token,
      user: usuario || session.user,
    }));
  } else {
    store.dispatch(logout());
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
