// auth.js corregido
const express = require('express');
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuario');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secreto-super-seguro';
const { validarRegistro, validarLogin } = require('../validators/usuario-validator');
const { validationResult } = require('express-validator');

// Registro
router.post('/registro', validarRegistro, async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ mensaje: 'Datos inválidos', errores: errores.array() });
  }

  try {
    const { nombre, correo, contraseña, rol } = req.body;

    // No permitir registro como admin desde el frontend
    if (rol === 'admin') {
      return res.status(403).json({ mensaje: 'No puedes registrarte como administrador.' });
    }

    // Si el rol es "visitante", lo guardamos como "cliente"
    let userRole = rol === 'visitante' ? 'cliente' : 'cliente';

    // Verifica si el correo ya está registrado
    const existeUsuario = await Usuario.findOne({ correo });
    if (existeUsuario) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
    }

    // Hashea la contraseña
    const hash = await bcrypt.hash(contraseña, 10);

    const usuario = new Usuario({
      nombre,
      correo,
      contraseña: hash,
      rol: userRole
    });

    await usuario.save();
    res.status(201).json({ mensaje: 'Usuario registrado correctamente.' });
  } catch (err) {
    res.status(400).json({ mensaje: 'Error al registrar usuario.', error: err.message });
  }
});

// Login
router.post('/login', validarLogin, async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ mensaje: 'Datos inválidos', errores: errores.array() });
  }

  const { correo, contraseña } = req.body;
  try {
    console.log('Intentando login con:', correo);
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      console.log('Usuario no encontrado');
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const esValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!esValida) {
      console.log('Contraseña incorrecta');
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, JWT_SECRET, { expiresIn: '1d' });
    console.log('Login exitoso para:', correo);
    res.json({ token, rol: usuario.rol, nombre: usuario.nombre });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
});

module.exports = router;