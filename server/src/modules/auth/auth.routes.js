import { Router } from 'express';
import { register, login, me, setupProfile } from './auth.controller.js';
import { authenticate, authenticateOrSetup } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/setup-profile', authenticateOrSetup, setupProfile);
router.get('/me', authenticate, me);

export default router;
