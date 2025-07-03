/**
 * @file Define el esquema de Mongoose para el modelo de Producto.
 * @requires mongoose
 */
const mongoose = require('mongoose');

/**
 * @const {mongoose.Schema} productoSchema - Esquema para los productos.
 */
const productoSchema = new mongoose.Schema({
  /**
   * Nombre del producto.
   * @type {string}
   */
  nombre: { type: String, required: true },
  /**
   * Precio del producto.
   * @type {number}
   */
  precio: { type: Number, required: true },
  /**
   * Descripción detallada del producto.
   * @type {string}
   */
  descripcion: { type: String },
  /**
   * Cantidad de unidades disponibles en inventario.
   * @type {number}
   */
  stock: { type: Number, required: true, default: 0 },
  /**
   * Ruta a la imagen del producto en el servidor.
   * @type {string}
   */
  imagen: { type: String },
  /**
   * Categoría a la que pertenece el producto.
   * @type {string}
   */
  categoria: { type: String }
});

const Producto = mongoose.model('Producto', productoSchema);

module.exports = Producto;
