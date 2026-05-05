import * as svc from './proyectos.service.js';

export async function crear(req, res) {
  try {
    const proyecto = await svc.crear(req.body, req.user.id);
    res.status(201).json(proyecto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function listar(req, res) {
  try {
    const proyectos = await svc.listar(req.query);
    res.json(proyectos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function obtenerPorHandle(req, res) {
  try {
    const proyecto = await svc.obtenerPorHandle(req.params.handle);
    res.json(proyecto);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
}

export async function actualizar(req, res) {
  try {
    const miembro = await svc.esMiembro(req.params.id, req.user.id);
    if (!miembro) return res.status(403).json({ error: 'No sos miembro' });
    const proyecto = await svc.actualizar(req.params.id, req.body);
    res.json(proyecto);
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

export async function misPproyectos(req, res) {
  try {
    const { data, error } = await import('../../config/db.js').then(m =>
      m.supabase
        .from('proyecto_miembros')
        .select('rol_interno, proyectos(*)')
        .eq('usuario_id', req.user.id)
    );
    if (error) throw new Error(error.message);
    res.json(data.map(d => ({ ...d.proyectos, rol_interno: d.rol_interno })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
