import { apiFetch } from './api';

export const listarEspacios = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/espacios${qs ? `?${qs}` : ''}`);
};

export const obtenerEspacio = (handle) => apiFetch(`/api/espacios/${handle}`);

export const misEspacios = (token) => apiFetch('/api/espacios/mios', {}, token);

export const buscarEspacios = (q) => apiFetch(`/api/espacios/buscar?q=${encodeURIComponent(q)}`);

export const crearEspacio = (body, token) =>
  apiFetch('/api/espacios', { method: 'POST', body: JSON.stringify(body) }, token);

export const actualizarEspacio = (id, body, token) =>
  apiFetch(`/api/espacios/${id}`, { method: 'PATCH', body: JSON.stringify(body) }, token);
