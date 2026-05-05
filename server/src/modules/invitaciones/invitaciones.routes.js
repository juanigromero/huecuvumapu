import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { invitar, aceptar, obtenerPorToken } from './invitaciones.controller.js';

const router = Router();

router.post('/', authenticate, invitar);
router.get('/:token', obtenerPorToken);
router.post('/:token/aceptar', authenticate, aceptar);

export default router;
