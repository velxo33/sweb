/**
 * @file Define el esquema de Mongoose para el modelo de Usuario.
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * @typedef {object} CarritoItem
 * @property {mongoose.Schema.Types.ObjectId} producto - Referencia al producto en el carrito.
 * @property {number} cantidad - Cantidad de dicho producto.
 */

/**
 * @const {mongoose.Schema} usuarioSchema - Esquema para los usuarios.
 */
const usuarioSchema = new mongoose.Schema({
  /**
   * Nombre del usuario.
   * @type {string}
   */
  nombre: String,

  /**
   * Correo electrónico del usuario. Debe ser único.
   * @type {string}
   */
  correo: {
    type: String,
    unique: true,
    required: true
  },

  /**
   * Contraseña hasheada del usuario.
   * @type {string}
   */
  contraseña: {
    type: String,
    required: true
  },

  /**
   * Rol del usuario en el sistema.
   * @type {string}
   * @enum ['admin', 'cliente']
   * @default 'cliente'
   */
  rol: {
    type: String,
    enum: ['admin', 'cliente'],
    default: 'cliente'
  },

  /**
   * Array de IDs de productos marcados como favoritos.
   * @type {mongoose.Schema.Types.ObjectId[]}
   */
  favoritos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto'
  }],

  /**
   * Array de objetos que representan los ítems en el carrito de compras.
   * @type {CarritoItem[]}
   */
  carrito: [{
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto'
    },
    cantidad: {
      type: Number,
      default: 1
    }
  }]
});

module.exports = mongoose.model('Usuario', usuarioSchema);
