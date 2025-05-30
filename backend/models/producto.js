const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  descripcion: { type: String },
  stock: { type: Number, required: true, default: 0 },
  imagen: { type: String }
});

const Producto = mongoose.model('Producto', productoSchema);

module.exports = Producto;
