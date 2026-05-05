import * as svc from './confirmaciones.service.js';

export async function listarPendientes(req, res) {
  try {
    const confirmaciones = await svc.listarPendientes(req.user.id);
    res.json(confirmaciones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function responder(req, res) {
  try {
    const { estado, nota } = req.body;
    if (!['confirmado', 'rechazado'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }
    const confirmacion = await svc.responder(req.params.id, req.user.id, estado, nota);
    res.json(confirmacion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
