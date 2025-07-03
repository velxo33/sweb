/**
 * @file Middleware para verificar el token de autenticación JWT.
 * @description Extrae y valida el token JWT de la cabecera 'Authorization'.
 * @requires jsonwebtoken
 */

const jwt = require('jsonwebtoken');

/**
 * Middleware que verifica un token JWT.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 * @param {function} next - La función para pasar al siguiente middleware.
 * @returns {void|object} Llama a `next()` si el token es válido, de lo contrario responde con un error 401 o 403.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Token requerido' });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'secreto-super-seguro';
    const decoded = jwt.verify(token, JWT_SECRET);
    // Adjunta el ID del usuario decodificado a la solicitud para uso posterior.
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = verifyToken;
