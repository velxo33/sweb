/**
 * @file Define el esquema de Mongoose para el modelo de Reseña.
 * @requires mongoose
 */
const mongoose = require('mongoose');

/**
 * @const {mongoose.Schema} resenaSchema - Esquema para las reseñas de productos.
 */
const resenaSchema = new mongoose.Schema({
  /**
   * ID del producto al que pertenece la reseña.
   * @type {mongoose.Schema.Types.ObjectId}
   */
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  /**
   * ID del usuario que escribió la reseña.
   * @type {mongoose.Schema.Types.ObjectId}
   */
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  /**
   * Contenido textual de la reseña.
   * @type {string}
   */
  comentario: { type: String, required: true },
  /**
   * Calificación en estrellas (de 1 a 5).
   * @type {number}
   */
  estrellas: { type: Number, min: 1, max: 5, required: true },
  /**
   * Fecha de creación de la reseña.
   * @type {Date}
   */
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resena', resenaSchema);
