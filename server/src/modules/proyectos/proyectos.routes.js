import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { crear, listar, obtenerPorHandle, actualizar, eliminar, misPproyectos } from './proyectos.controller.js';

const router = Router();

router.get('/', listar);
router.get('/mios', authenticate, misPproyectos);
router.get('/:handle', obtenerPorHandle);
router.post('/', authenticate, crear);
router.patch('/:id', authenticate, actualizar);
router.delete('/:id', authenticate, eliminar);

export default router;
