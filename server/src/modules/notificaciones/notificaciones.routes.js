import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import * as svc from './notificaciones.service.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req, res) => {
  try { res.json(await svc.listar(req.user.id)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/leer', async (req, res) => {
  try { await svc.marcarLeida(req.params.id, req.user.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/leer-todas', async (req, res) => {
  try { await svc.marcarTodasLeidas(req.user.id); res.json({ ok: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
