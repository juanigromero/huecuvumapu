import * as svc from './moderacion.service.js';

export async function listarPendientes(req, res) {
  try {
    const eventos = await svc.listarPendientes();
    res.json(eventos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function aprobar(req, res) {
  try {
    const evento = await svc.aprobar(req.params.id);
    res.json(evento);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function rechazar(req, res) {
  try {
    const evento = await svc.rechazar(req.params.id, req.body.nota);
    res.json(evento);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
