import * as svc from './invitaciones.service.js';

export async function invitar(req, res) {
  try {
    const resultado = await svc.invitar(req.body, req.user.id);
    res.json(resultado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function aceptar(req, res) {
  try {
    const resultado = await svc.aceptar(req.params.token, req.user.id);
    res.json(resultado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function obtenerPorToken(req, res) {
  try {
    const inv = await svc.obtenerPorToken(req.params.token);
    res.json(inv);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}
