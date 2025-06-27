
const { body } = require('express-validator');

const validarProducto = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('precio').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un entero positivo'),
];

module.exports = validarProducto;
