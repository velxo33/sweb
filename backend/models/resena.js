const mongoose = require('mongoose');

const resenaSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  comentario: { type: String, required: true },
  estrellas: { type: Number, min: 1, max: 5, required: true },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Resena', resenaSchema);
