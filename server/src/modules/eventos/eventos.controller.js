import * as svc from './eventos.service.js';

export async function crear(req, res) {
  try {
    const evento = await svc.crear(req.body, req.user.id);
    res.status(201).json(evento);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function listar(req, res) {
  try {
    const eventos = await svc.listar(req.query);
    res.json(eventos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function obtener(req, res) {
  try {
    const evento = await svc.obtener(req.params.id);
    res.json(evento);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

export async function actualizar(req, res) {
  try {
    const evento = await svc.actualizar(req.params.id, req.body, req.user.id);
    res.json(evento);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function toggleAgotado(req, res) {
  try {
    const evento = await svc.toggleAgotado(req.params.id, req.user.id);
    res.json(evento);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function cancelar(req, res) {
  try {
    const evento = await svc.cancelar(req.params.id, req.user.id);
    res.json(evento);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function misEventos(req, res) {
  try {
    const eventos = await svc.misEventos(req.user.id);
    res.json(eventos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
