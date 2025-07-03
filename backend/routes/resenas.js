/**
 * @file Contiene las rutas de la API para la gestión de reseñas de productos.
 * @description Define endpoints para crear, leer y calcular el promedio de reseñas.
 * @requires mongoose
 * @requires express
 * @requires jsonwebtoken
 * @requires ../models/resena
 * @requires ../models/producto
 */

const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Resena = require('../models/resena');
const Producto = require('../models/producto');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto-super-seguro';

/**
 * Middleware para verificar el token JWT.
 * @param {object} req - Objeto de solicitud.
 * @param {object} res - Objeto de respuesta.
 * @param {function} next - Función para pasar al siguiente middleware.
 */
function verificarToken(req, res, next) {
  const token = req.headers['authorization']?.split(" ")[1];
  if (!token) return res.status(401).json({ mensaje: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token inválido' });
  }
}

/**
 * @route   POST /resenas/:productoId
 * @desc    Crea una nueva reseña para un producto.
 * @access  Private
 */
router.post('/:productoId', verificarToken, async (req, res) => {
  try {
    const { comentario, estrellas } = req.body;
    if (!comentario || !estrellas) {
        return res.status(400).json({ mensaje: 'Comentario y estrellas son requeridos.' });
    }

    const producto = await Producto.findById(req.params.productoId);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });

    const nuevaResena = new Resena({
      producto: producto._id,
      usuario: req.usuario.id,
      comentario,
      estrellas
    });

    await nuevaResena.save();
    res.status(201).json(nuevaResena);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al guardar reseña' });
  }
});

/**
 * @route   GET /resenas/:productoId
 * @desc    Obtiene todas las reseñas de un producto específico.
 * @access  Public
 */
router.get('/:productoId', async (req, res) => {
  try {
    const reseñas = await Resena.find({ producto: req.params.productoId })
      .populate('usuario', 'nombre') // Solo trae el nombre del usuario
      .sort({ fecha: -1 }); // Muestra las más recientes primero
    res.json(reseñas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener reseñas' });
  }
});

/**
 * @route   GET /resenas/:productoId/promedio
 * @desc    Calcula y obtiene la calificación promedio de un producto.
 * @access  Public
 */
router.get('/:productoId/promedio', async (req, res) => {
  try {
    const resultado = await Resena.aggregate([
      { $match: { producto: new mongoose.Types.ObjectId(req.params.productoId) } },
      { $group: { _id: null, promedio: { $avg: '$estrellas' } } }
    ]);

    // Si hay resultado, lo formatea a un decimal, si no, devuelve 0.0.
    const promedioFinal = resultado[0] ? resultado[0].promedio.toFixed(1) : "0.0";
    res.json({ promedio: promedioFinal });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al calcular promedio' });
  }
});

module.exports = router;
