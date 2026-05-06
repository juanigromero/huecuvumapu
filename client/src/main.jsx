import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import { setCredentials, logout } from './store/authSlice';
import { supabase } from './lib/supabase';
import App from './App.jsx';
import './index.css';

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED' && session) {
    // Solo actualizamos el token, mantenemos el user de Redux
    store.dispatch(setCredentials({
      token: session.access_token,
      user: store.getState().auth.user,
    }));
  } else if (event === 'SIGNED_OUT') {
    store.dispatch(logout());
  }
  // INITIAL_SESSION y SIGNED_IN los maneja login/register manualmente
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
