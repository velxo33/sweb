const express = require('express');
const router = express.Router();
const Producto = require('../models/producto');
const verifyToken = require('../middleware-jwt');
const soloAdmin = require('../middleware-admin');
const upload = require('../middleware-multer');
const { body, validationResult } = require('express-validator');

// Validaciones
const validarProducto = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('precio').isFloat({ gt: 0 }).withMessage('El precio debe ser un número positivo'),
];

