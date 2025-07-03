/**
 * @file Contiene las reglas de validación para las rutas de reseñas.
 * @description Utiliza express-validator para definir y exportar middlewares de validación para la creación de reseñas.
 * @requires express-validator
 */
const { body } = require('express-validator');

/**
 * @const {ValidationChain[]} validarResena - Array de middlewares de validación para las reseñas.
 */
const validarResena = [
  body('usuario')
    .notEmpty().withMessage('El ID de usuario es requerido.'),

  body('producto')
    .notEmpty().withMessage('El ID de producto es requerido.'),

  body('comentario')
    .trim()
    .notEmpty().withMessage('El comentario no puede estar vacío.')
    .isLength({ min: 5, max: 500 }).withMessage('El comentario debe tener entre 5 y 500 caracteres.'),

  body('puntuacion')
    .isInt({ min: 1, max: 5 }).withMessage('La puntuación debe estar entre 1 y 5'),
];

module.exports = validarResena;
