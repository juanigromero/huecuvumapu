import { apiFetch } from './api';

export const listarEventos = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/eventos${qs ? `?${qs}` : ''}`);
};

export const obtenerEvento = (id) => apiFetch(`/api/eventos/${id}`);

export const misEventos = (token) => apiFetch('/api/eventos/mios', {}, token);

export const crearEvento = (body, token) =>
  apiFetch('/api/eventos', { method: 'POST', body: JSON.stringify(body) }, token);

export const actualizarEvento = (id, body, token) =>
  apiFetch(`/api/eventos/${id}`, { method: 'PATCH', body: JSON.stringify(body) }, token);

export const toggleAgotado = (id, token) =>
  apiFetch(`/api/eventos/${id}/agotado`, { method: 'PATCH' }, token);

export const cancelarEvento = (id, token) =>
  apiFetch(`/api/eventos/${id}/cancelar`, { method: 'PATCH' }, token);
