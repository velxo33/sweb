const { body } = require('express-validator');

const validarRegistro = [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres.')
    .matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/).withMessage('El nombre solo puede contener letras y espacios.'),
  body('correo')
    .trim()
    .isEmail().withMessage('Correo inválido.')
    .isLength({ max: 100 }).withMessage('El correo debe tener máximo 100 caracteres.'),
  body('contraseña')
    .isLength({ min: 8, max: 32 }).withMessage('La contraseña debe tener entre 8 y 32 caracteres.'),
  body('rol')
    .optional().isIn(['cliente', 'visitante']).withMessage('Rol inválido.')
];

const validarLogin = [
  body('correo')
    .trim()
    .isEmail().withMessage('Correo inválido.'),
  body('contraseña')
    .isLength({ min: 8, max: 32 }).withMessage('La contraseña debe tener entre 8 y 32 caracteres.')
];

module.exports = { validarRegistro, validarLogin };