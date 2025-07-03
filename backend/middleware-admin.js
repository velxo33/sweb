/**
 * @file Middleware para restringir el acceso solo a administradores.
 * @description Verifica si el usuario adjunto a la solicitud (`req.usuario`) tiene el rol de 'admin'.
 */

/**
 * Middleware que comprueba el rol de administrador.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 * @param {function} next - La función para pasar al siguiente middleware.
 * @returns {void|object} Llama a `next()` si el usuario es admin, de lo contrario responde con un error 403.
 */
module.exports = function soloAdmin(req, res, next) {
  // El objeto req.usuario debe ser establecido previamente por un middleware de autenticación (ej. verificarToken).
  if (!req.usuario || req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso restringido a administradores' });
  }
  next();
};
