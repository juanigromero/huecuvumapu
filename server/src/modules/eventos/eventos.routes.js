import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { crear, listar, obtener, actualizar, toggleAgotado, cancelar, misEventos } from './eventos.controller.js';

const router = Router();

router.get('/', listar);
router.get('/mios', authenticate, misEventos);
router.get('/:id', obtener);
router.post('/', authenticate, crear);
router.patch('/:id', authenticate, actualizar);
router.patch('/:id/agotado', authenticate, toggleAgotado);
router.patch('/:id/cancelar', authenticate, cancelar);

export default router;
