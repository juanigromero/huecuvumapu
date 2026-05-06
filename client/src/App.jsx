import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProyectoPerfil from './pages/ProyectoPerfil';
import EspacioPerfil from './pages/EspacioPerfil';
import NuevoEvento from './pages/NuevoEvento';
import CrearProyecto from './pages/CrearProyecto';
import CrearEspacio from './pages/CrearEspacio';
import Mapa from './pages/Mapa';
import AceptarInvitacion from './pages/AceptarInvitacion';
import EventoDetalle from './pages/EventoDetalle';
import EditarProyecto from './pages/EditarProyecto';
import EditarEspacio from './pages/EditarEspacio';
import EditarPerfil from './pages/EditarPerfil';
import EditarEvento from './pages/EditarEvento';
import Admin from './pages/Admin';
import AdminRoute from './components/ui/AdminRoute';
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
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/invitacion/:token" element={<AceptarInvitacion />} />
        <Route path="/eventos/:id" element={<EventoDetalle />} />
        <Route path="/p/:handle/editar" element={<ProtectedRoute><EditarProyecto /></ProtectedRoute>} />
        <Route path="/e/:handle/editar" element={<ProtectedRoute><EditarEspacio /></ProtectedRoute>} />
        <Route path="/perfil/editar" element={<ProtectedRoute><EditarPerfil /></ProtectedRoute>} />
        <Route path="/eventos/:id/editar" element={<ProtectedRoute><EditarEvento /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/nuevo-evento"
          element={<ProtectedRoute><NuevoEvento /></ProtectedRoute>}
        />
        <Route
          path="/crear-proyecto"
          element={<ProtectedRoute><CrearProyecto /></ProtectedRoute>}
        />
        <Route
          path="/crear-espacio"
          element={<ProtectedRoute><CrearEspacio /></ProtectedRoute>}
        />
      </Routes>
    </BrowserRouter>
  );
}
