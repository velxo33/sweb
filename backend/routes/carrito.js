const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secreto-super-seguro';

// Middleware de autenticación
function auth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ mensaje: 'Token requerido' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ mensaje: 'Token inválido' });
    }
}

// Obtener carrito del usuario
router.get('/', auth, async (req, res) => {
    const usuario = await Usuario.findById(req.user.id).populate('carrito.producto');
    res.json(usuario.carrito);
});



// Cambiar cantidad de un producto
router.put('/:productoId', auth, async (req, res) => {
    const usuario = await Usuario.findById(req.user.id);
    const { productoId } = req.params;
    const cantidad = req.body && typeof req.body.cantidad !== 'undefined' ? Number(req.body.cantidad) : 1;
    const item = usuario.carrito.find(i => i.producto.toString() === productoId);
    if (item && cantidad > 0) {
        item.cantidad = Number(cantidad);
        await usuario.save();
        res.json({ mensaje: 'Cantidad actualizada' });
    } else if (item && cantidad <= 0) {
        usuario.carrito = usuario.carrito.filter(i => i.producto.toString() !== productoId);
        await usuario.save();
        res.json({ mensaje: 'Producto eliminado del carrito' });
    } else {
        res.status(404).json({ mensaje: 'Producto no está en el carrito' });
    }
});

// Quitar producto del carrito
router.delete('/:productoId', auth, async (req, res) => {
    const usuario = await Usuario.findById(req.user.id);
    usuario.carrito = usuario.carrito.filter(i => i.producto.toString() !== req.params.productoId);
    await usuario.save();
    res.json({ mensaje: 'Producto eliminado del carrito' });
});

// Finalizar compra
router.post('/finalizar', auth, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.user.id).populate('carrito.producto');
        if (!usuario.carrito.length) {
            return res.status(400).json({ mensaje: 'El carrito está vacío.' });
        }

        // Verifica stock y existencia de productos
        for (const item of usuario.carrito) {
            if (!item.producto) {
                return res.status(400).json({ mensaje: 'Uno de los productos ya no existe.' });
            }
            if (item.producto.stock < item.cantidad) {
                return res.status(400).json({ mensaje: `No hay suficiente stock de ${item.producto.nombre}` });
            }
        }
        for (const item of usuario.carrito) {
            item.producto.stock -= item.cantidad;
            await item.producto.save();
        }

        // Limpia el carrito
        usuario.carrito = [];
        await usuario.save();

        res.json({ mensaje: '¡Compra realizada con éxito!' });
    } catch (error) {
        console.error('Error en /carrito/finalizar:', error);
        res.status(500).json({ mensaje: 'Error interno al finalizar la compra' });
    }
});

// Agregar producto al carrito
router.post('/:productoId', auth, async (req, res) => {
    const usuario = await Usuario.findById(req.user.id);
    const { productoId } = req.params;
    const cantidad = req.body && typeof req.body.cantidad !== 'undefined' ? Number(req.body.cantidad) : 1;    const item = usuario.carrito.find(i => i.producto.toString() === productoId);
    if (item) {
        item.cantidad += cantidad ? Number(cantidad) : 1;
    } else {
        usuario.carrito.push({ producto: productoId, cantidad: cantidad ? Number(cantidad) : 1 });
    }
    await usuario.save();
    res.json({ mensaje: 'Producto agregado al carrito' });
});

module.exports = router;