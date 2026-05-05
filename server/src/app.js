import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';

import authRoutes from './modules/auth/auth.routes.js';
import usuariosRoutes from './modules/usuarios/usuarios.routes.js';
import proyectosRoutes from './modules/proyectos/proyectos.routes.js';
import espaciosRoutes from './modules/espacios/espacios.routes.js';
import eventosRoutes from './modules/eventos/eventos.routes.js';
import confirmacionesRoutes from './modules/confirmaciones/confirmaciones.routes.js';
import invitacionesRoutes from './modules/invitaciones/invitaciones.routes.js';
import moderacionRoutes from './modules/moderacion/moderacion.routes.js';

const app = express();

app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/proyectos', proyectosRoutes);
app.use('/api/espacios', espaciosRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/confirmaciones', confirmacionesRoutes);
app.use('/api/invitaciones', invitacionesRoutes);
app.use('/api/moderacion', moderacionRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

export default app;
