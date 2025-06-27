
const { body } = require('express-validator');

const validarResena = [
  body('usuario').notEmpty().withMessage('Usuario requerido'),
  body('producto').notEmpty().withMessage('Producto requerido'),
  body('comentario').notEmpty().withMessage('Comentario requerido'),
  body('puntuacion').isInt({ min: 1, max: 5 }).withMessage('Puntuación debe estar entre 1 y 5'),
];

module.exports = validarResena;
