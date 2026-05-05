import { apiFetch } from './api';

export const listarProyectos = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/proyectos${qs ? `?${qs}` : ''}`);
};

export const obtenerProyecto = (handle) => apiFetch(`/api/proyectos/${handle}`);

export const misProyectos = (token) => apiFetch('/api/proyectos/mios', {}, token);

export const crearProyecto = (body, token) =>
  apiFetch('/api/proyectos', { method: 'POST', body: JSON.stringify(body) }, token);

export const actualizarProyecto = (id, body, token) =>
  apiFetch(`/api/proyectos/${id}`, { method: 'PATCH', body: JSON.stringify(body) }, token);
