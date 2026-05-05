import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { requireAdmin } from '../../middlewares/roles.middleware.js';
import { listarPendientes, aprobar, rechazar } from './moderacion.controller.js';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/pendientes', listarPendientes);
router.patch('/:id/aprobar', aprobar);
router.patch('/:id/rechazar', rechazar);

export default router;
