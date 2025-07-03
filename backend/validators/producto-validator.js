/**
 * @file Contiene las reglas de validación para las rutas de productos.
 * @description Utiliza express-validator para definir y exportar middlewares de validación para la creación y actualización de productos.
 * @requires express-validator
 */
const { body } = require('express-validator');

/**
 * @const {ValidationChain[]} validarProducto - Array de middlewares de validación para los productos.
 */
const validarProducto = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio'),

  body('precio')
    .isFloat({ min: 0, max: 10000 }).withMessage('El precio debe ser un número entre 0 y 10000.'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo.'),

  body('categoria')
    .trim()
    .notEmpty().withMessage('La categoría es obligatoria'),
];

module.exports = validarProducto;
