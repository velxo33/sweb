
const { body } = require('express-validator');

const validarProducto = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
body('precio').isFloat({ min: 0, max: 10000 }).withMessage('El precio debe ser un número positivo y no mayor a 90'),  body('stock').optional().isInt({ min: 0 }).withMessage('El stock debe ser un entero positivo'),
  body('categoria').notEmpty().withMessage('La categoría es obligatoria'),
];

module.exports = validarProducto;
