export function requireAdmin(req, res, next) {
  if (!req.user?.es_admin) return res.status(403).json({ error: 'Admin only' });
  next();
}
