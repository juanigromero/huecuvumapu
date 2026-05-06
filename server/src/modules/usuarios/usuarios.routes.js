import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { supabase } from '../../config/db.js';

const router = Router();

router.patch('/:id', authenticate, async (req, res) => {
  if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Sin permiso' });
  const { nombre, avatar_url } = req.body;
  const { data, error } = await supabase
    .from('usuarios')
    .update({ nombre, avatar_url })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

export default router;
