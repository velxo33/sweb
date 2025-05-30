// auth.js corregido
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto-super-seguro';

// Registro
router.post('/registro', async (req, res) => {
  const { nombre, correo, contraseña, rol } = req.body;
  if (!nombre || !correo || !contraseña || !rol) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
  }
  try {
    const usuarioExistente = await Usuario.findOne({ correo });
    if (usuarioExistente) return res.status(400).json({ mensaje: 'Correo ya registrado' });

    const hashedPassword = await bcrypt.hash(contraseña, 10);
    const nuevoUsuario = new Usuario({ nombre, correo, contraseña: hashedPassword, rol });
    await nuevoUsuario.save();

    const token = jwt.sign({ id: nuevoUsuario._id, rol: nuevoUsuario.rol }, JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ mensaje: 'Usuario registrado correctamente', token });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar usuario' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { correo, contraseña } = req.body;
  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const esValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!esValida) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión' });
  }
});

module.exports = router;
