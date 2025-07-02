const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: String,
    correo: { type: String, unique: true },
    contraseña: String,
    rol: { type: String, enum: ['admin', 'cliente'], default: 'cliente' },
    favoritos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Producto' }],
    carrito: [{
        producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto' },
        cantidad: { type: Number, default: 1 }
    }]
});

module.exports = mongoose.model('Usuario', usuarioSchema);
