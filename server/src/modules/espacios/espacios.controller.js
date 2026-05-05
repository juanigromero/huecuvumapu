import * as svc from './espacios.service.js';

export async function crear(req, res) {
  try {
    const espacio = await svc.crear(req.body, req.user.id);
    res.status(201).json(espacio);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function listar(req, res) {
  try {
    const espacios = await svc.listar(req.query);
    res.json(espacios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function obtenerPorHandle(req, res) {
  try {
    const espacio = await svc.obtenerPorHandle(req.params.handle);
    res.json(espacio);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

export async function actualizar(req, res) {
  try {
    const miembro = await svc.esMiembro(req.params.id, req.user.id);
    if (!miembro) return res.status(403).json({ error: 'No sos miembro' });
    const espacio = await svc.actualizar(req.params.id, req.body);
    res.json(espacio);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function eliminar(req, res) {
  try {
    const miembro = await svc.esMiembro(req.params.id, req.user.id);
    if (miembro?.rol_interno !== 'owner') return res.status(403).json({ error: 'Solo el owner puede eliminar' });
    await svc.eliminar(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function buscar(req, res) {
  try {
    const espacios = await svc.buscar(req.query.q || '');
    res.json(espacios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function misEspacios(req, res) {
  try {
    const { data, error } = await import('../../config/db.js').then(m =>
      m.supabase
        .from('espacio_miembros')
        .select('rol_interno, espacios(*)')
        .eq('usuario_id', req.user.id)
    );
    if (error) throw new Error(error.message);
    res.json(data.map(d => ({ ...d.espacios, rol_interno: d.rol_interno })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
