const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Resena = require('../models/resena');
const Producto = require('../models/producto');

const JWT_SECRET = 'secreto-super-seguro';

// Middleware para verificar token
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

// Crear reseña
router.post('/:productoId', verificarToken, async (req, res) => {
  try {
    const { comentario, estrellas } = req.body;
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

// Obtener reseñas de un producto
router.get('/:productoId', async (req, res) => {
  try {
    const reseñas = await Resena.find({ producto: req.params.productoId })
      .populate('usuario', 'nombre')
      .sort({ fecha: -1 });
    res.json(reseñas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener reseñas' });
  }
});

// Obtener promedio de calificación de un producto
router.get('/:productoId/promedio', async (req, res) => {
  try {
    const resultado = await Resena.aggregate([
      { $match: { producto: new mongoose.Types.ObjectId(req.params.productoId) } },
      { $group: { _id: null, promedio: { $avg: '$estrellas' } } }
    ]);

    res.json({ promedio: resultado[0] ? resultado[0].promedio.toFixed(1) : "0.0" });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al calcular promedio' });
  }
});

module.exports = router;
