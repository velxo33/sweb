/**
 * @file Contiene las rutas de la API para autenticación (registro y login).
 * @description Define los endpoints para registrar nuevos usuarios y para iniciar sesión, aplicando validaciones y generando tokens JWT.
 * @requires express
 * @requires bcryptjs
 * @requires jsonwebtoken
 * @requires ../models/usuario
 * @requires ../validators/usuario-validator
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const router = express.Router();
const { validarRegistro, validarLogin } = require('../validators/usuario-validator');
const { validationResult } = require('express-validator');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto-super-seguro';

/**
 * @route   POST /auth/registro
 * @desc    Registra un nuevo usuario.
 * @access  Public
 */
router.post('/registro', validarRegistro, async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ mensaje: 'Datos inválidos', errores: errores.array() });
  }

  try {
    const { nombre, correo, contraseña, rol } = req.body;

    // Medida de seguridad: no permitir el registro de administradores desde el endpoint público.
    if (rol === 'admin') {
      return res.status(403).json({ mensaje: 'No puedes registrarte como administrador.' });
    }

    // Unifica el rol 'visitante' a 'cliente' para consistencia.
    const userRole = (rol === 'visitante' || rol === 'cliente') ? 'cliente' : 'cliente';

    const existeUsuario = await Usuario.findOne({ correo });
    if (existeUsuario) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
    }

    const hash = await bcrypt.hash(contraseña, 10);

    const usuario = new Usuario({ nombre, correo, contraseña: hash, rol: userRole });
    await usuario.save();
    res.status(201).json({ mensaje: 'Usuario registrado correctamente.' });
  } catch (err) {
    console.error("Error en registro:", err);
    res.status(500).json({ mensaje: 'Error al registrar usuario.', error: err.message });
  }
});

/**
 * @route   POST /auth/login
 * @desc    Inicia sesión y devuelve un token JWT.
 * @access  Public
 */
router.post('/login', validarLogin, async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ mensaje: 'Datos inválidos', errores: errores.array() });
  }

  const { correo, contraseña } = req.body;
  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Credenciales incorrectas.' }); // Mensaje genérico por seguridad
    }

    const esValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!esValida) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas.' }); // Mensaje genérico por seguridad
    }

    const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, rol: usuario.rol, nombre: usuario.nombre });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
});

module.exports = router;