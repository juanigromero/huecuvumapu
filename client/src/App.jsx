import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProyectoPerfil from './pages/ProyectoPerfil';
import EspacioPerfil from './pages/EspacioPerfil';
import NuevoEvento from './pages/NuevoEvento';
import ProtectedRoute from './components/ui/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/p/:handle" element={<ProyectoPerfil />} />
        <Route path="/e/:handle" element={<EspacioPerfil />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/nuevo-evento"
          element={<ProtectedRoute><NuevoEvento /></ProtectedRoute>}
        />
      </Routes>
    </BrowserRouter>
  );
}
