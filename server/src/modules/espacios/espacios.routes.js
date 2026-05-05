import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { crear, listar, obtenerPorHandle, actualizar, eliminar, buscar, misEspacios } from './espacios.controller.js';

const router = Router();

router.get('/', listar);
router.get('/buscar', buscar);
router.get('/mios', authenticate, misEspacios);
router.get('/:handle', obtenerPorHandle);
router.post('/', authenticate, crear);
router.patch('/:id', authenticate, actualizar);
router.delete('/:id', authenticate, eliminar);

export default router;
