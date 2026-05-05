import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { listarPendientes, responder } from './confirmaciones.controller.js';

const router = Router();

router.get('/pendientes', authenticate, listarPendientes);
router.patch('/:id', authenticate, responder);

export default router;
