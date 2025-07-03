/**
 * @file Contiene las rutas de la API para la gestión de productos.
 * @description Define los endpoints para el CRUD de productos, protegidos por middlewares de autenticación y autorización.
 * @requires express
 * @requires ../models/producto
 * @requires ../middleware-multer
 * @requires jsonwebtoken
 */

const express = require('express');
const router = express.Router();
const Producto = require('../models/producto');
const upload = require('../middleware-multer');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secreto-super-seguro';

/**
 * Middleware para verificar el token JWT.
 * @param {object} req - Objeto de solicitud.
 * @param {object} res - Objeto de respuesta.
 * @param {function} next - Función para pasar al siguiente middleware.
 */
function verificarToken(req, res, next) {
  const token = req.headers['authorization']?.split(" ")[1];
  if (!token) return res.status(401).json({
    mensaje: 'Token requerido'
  });
  try {
    req.usuario = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({
      mensaje: 'Token inválido'
    });
  }
}

/**
 * Middleware para verificar el rol de administrador.
 * @param {object} req - Objeto de solicitud.
 * @param {object} res - Objeto de respuesta.
 * @param {function} next - Función para pasar al siguiente middleware.
 */
function soloAdmin(req, res, next) {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({
      mensaje: 'Acceso restringido a administradores'
    });
  }
  next();
}

/**
 * @route   GET /productos
 * @desc    Obtiene todos los productos.
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener productos',
      error: error.message
    });
  }
});

/**
 * @route   POST /productos
 * @desc    Crea un nuevo producto.
 * @access  Private (Admin)
 */
router.post('/', verificarToken, soloAdmin, upload.single('imagen'), async (req, res) => {
  try {
    const {
      nombre,
      precio,
      descripcion,
      stock,
      categoria
    } = req.body;
    const imagen = req.file ? '/uploads/' + req.file.filename : null;

    if (!nombre || precio === undefined || !descripcion || stock === undefined || !categoria) {
      return res.status(400).json({
        mensaje: 'Todos los campos son obligatorios.'
      });
    }

    const nuevoProducto = new Producto({
      nombre,
      precio: Number(precio),
      descripcion,
      stock: Number(stock),
      imagen,
      categoria
    });
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al crear producto',
      error: error.message
    });
  }
});

/**
 * @route   GET /productos/:id
 * @desc    Obtiene un producto por su ID.
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({
      mensaje: 'Producto no encontrado'
    });
    res.json(producto);
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al obtener producto',
      error: error.message
    });
  }
});

/**
 * @route   PUT /productos/:id
 * @desc    Actualiza un producto por su ID.
 * @access  Private (Admin)
 */
router.put('/:id', verificarToken, soloAdmin, upload.single('imagen'), async (req, res) => {
  try {
    const {
      nombre,
      precio,
      descripcion,
      stock,
      categoria
    } = req.body;
    const datosActualizados = {
      nombre,
      precio: precio !== undefined ? Number(precio) : undefined,
      descripcion,
      stock: stock !== undefined ? Number(stock) : undefined,
      categoria
    };
    if (req.file) {
      datosActualizados.imagen = '/uploads/' + req.file.filename;
    }
    const producto = await Producto.findByIdAndUpdate(req.params.id, datosActualizados, {
      new: true
    });
    if (!producto) return res.status(404).json({
      mensaje: 'Producto no encontrado'
    });
    res.json(producto);
  } catch (error) {
    res.status(400).json({
      mensaje: 'Error al actualizar producto',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /productos/:id
 * @desc    Elimina un producto por su ID.
 * @access  Private (Admin)
 */
router.delete('/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({
      mensaje: 'Producto no encontrado'
    });
    res.status(204).send(); // 204 No Content
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error al eliminar producto',
      error: error.message
    });
  }
});

module.exports = router;

