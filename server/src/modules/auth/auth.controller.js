import * as authService from './auth.service.js';
import { vincularInvitacionesPendientes } from '../invitaciones/invitaciones.service.js';

export async function register(req, res) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function login(req, res) {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

export async function me(req, res) {
  res.json(req.user);
}

export async function setupProfile(req, res) {
  try {
    const { nombre } = req.body;
    // El usuario ya está autenticado (authenticate middleware lo verificó)
    // Si ya tiene perfil (authenticate lo cargó), simplemente lo devolvemos
    if (req.user) return res.json({ usuario: req.user });

    // Si no tiene perfil aún, crearlo
    const result = await authService.crearPerfil(req.authUserId, req.authEmail, nombre);

    // Vincular invitaciones pendientes con ese email
    await vincularInvitacionesPendientes(req.authEmail, req.authUserId);

    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
