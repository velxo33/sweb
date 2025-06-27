const express = require('express');
const router = express.Router();
const Producto = require('../models/producto');
const { validationResult } = require('express-validator');
const validarProducto = require('../validators/producto-validator');
const upload = require('../middleware-multer');

// Middlewares de autenticación y admin
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secreto-super-seguro';

function verificarToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ mensaje: 'Token requerido' });
  try {
    const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token inválido' });
  }
}

function soloAdmin(req, res, next) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso restringido a administradores' });
  }
  next();
}

// Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos' });
  }
});

// Crear producto
router.post('/', verificarToken, soloAdmin, upload.single('imagen'), validarProducto, async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  try {
    let { nombre, precio, descripcion, stock, categoria } = req.body;
    precio = precio !== undefined ? Number(precio) : undefined;
    stock = stock !== undefined ? Number(stock) : undefined;
    const imagen = req.file ? '/uploads/' + req.file.filename : null;
    const nuevoProducto = new Producto({ nombre, precio, descripcion, stock, imagen, categoria });
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear producto' });
  }
});

// Obtener producto por ID
router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener producto' });
  }
});

// Actualizar producto por ID
router.put('/:id', verificarToken, soloAdmin, upload.single('imagen'), validarProducto, async (req, res) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  try {
    let { nombre, precio, descripcion, stock, categoria } = req.body;
    precio = precio !== undefined ? Number(precio) : undefined;
    stock = stock !== undefined ? Number(stock) : undefined;
    const datosActualizados = { nombre, precio, descripcion, stock, categoria };
    if (req.file) {
      datosActualizados.imagen = '/uploads/' + req.file.filename;
    }
    const producto = await Producto.findByIdAndUpdate(req.params.id, datosActualizados, { new: true });
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar producto' });
  }
});

// Eliminar producto por ID
router.delete('/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar producto' });
  }
});

module.exports = router;

