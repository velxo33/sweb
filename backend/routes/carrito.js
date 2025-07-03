/**
 * @file Contiene las rutas de la API para la gestión del carrito de compras.
 * @description Define endpoints para ver, agregar, modificar, eliminar y finalizar la compra de productos en el carrito.
 * @requires express
 * @requires ../models/usuario
 * @requires ../models/producto
 * @requires jsonwebtoken
 */

const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secreto-super-seguro';

/**
 * Middleware de autenticación para proteger las rutas del carrito.
 * @param {object} req - Objeto de solicitud.
 * @param {object} res - Objeto de respuesta.
 * @param {function} next - Función para pasar al siguiente middleware.
 */
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

/**
 * @route   GET /carrito
 * @desc    Obtiene el carrito del usuario autenticado.
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.user.id).populate('carrito.producto');
        res.json(usuario.carrito);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener el carrito.' });
    }
});

/**
 * @route   POST /carrito/finalizar
 * @desc    Finaliza la compra, descuenta el stock y vacía el carrito.
 * @access  Private
 */
router.post('/finalizar', auth, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.user.id).populate('carrito.producto');
        if (!usuario.carrito.length) {
            return res.status(400).json({ mensaje: 'El carrito está vacío.' });
        }

        // Verifica existencia y stock de todos los productos en una transacción simulada.
        for (const item of usuario.carrito) {
            if (!item.producto) {
                return res.status(400).json({ mensaje: `Un producto en tu carrito ya no existe. Por favor, revisa tu carrito.` });
            }
            if (item.producto.stock < item.cantidad) {
                return res.status(400).json({ mensaje: `No hay suficiente stock de ${item.producto.nombre}.` });
            }
        }

        // Si todo está bien, descuenta el stock.
        for (const item of usuario.carrito) {
            item.producto.stock -= item.cantidad;
            await item.producto.save();
        }

        // Limpia el carrito del usuario.
        usuario.carrito = [];
        await usuario.save();

        res.json({ mensaje: '¡Compra realizada con éxito!' });
    } catch (error) {
        console.error('Error en /carrito/finalizar:', error);
        res.status(500).json({ mensaje: 'Error interno al finalizar la compra', error: error.message });
    }
});

/**
 * @route   POST /carrito/:productoId
 * @desc    Agrega un producto al carrito o incrementa su cantidad.
 * @access  Private
 */
router.post('/:productoId', auth, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.user.id);
        const { productoId } = req.params;
        const cantidad = req.body && typeof req.body.cantidad !== 'undefined' ? Number(req.body.cantidad) : 1;
        
        const itemIndex = usuario.carrito.findIndex(i => i.producto.toString() === productoId);
        
        if (itemIndex > -1) {
            usuario.carrito[itemIndex].cantidad += cantidad;
        } else {
            usuario.carrito.push({ producto: productoId, cantidad });
        }
        await usuario.save();
        res.json({ mensaje: 'Producto agregado al carrito' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al agregar al carrito.' });
    }
});

/**
 * @route   PUT /carrito/:productoId
 * @desc    Actualiza la cantidad de un producto en el carrito.
 * @access  Private
 */
router.put('/:productoId', auth, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.user.id);
        const { productoId } = req.params;
        const cantidad = req.body && typeof req.body.cantidad !== 'undefined' ? Number(req.body.cantidad) : 1;
        
        const item = usuario.carrito.find(i => i.producto.toString() === productoId);
        
        if (item && cantidad > 0) {
            item.cantidad = cantidad;
            await usuario.save();
            res.json({ mensaje: 'Cantidad actualizada' });
        } else if (item && cantidad <= 0) {
            // Si la cantidad es 0 o menos, elimina el producto.
            usuario.carrito = usuario.carrito.filter(i => i.producto.toString() !== productoId);
            await usuario.save();
            res.json({ mensaje: 'Producto eliminado del carrito' });
        } else {
            res.status(404).json({ mensaje: 'Producto no encontrado en el carrito' });
        }
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al actualizar la cantidad.' });
    }
});

/**
 * @route   DELETE /carrito/:productoId
 * @desc    Elimina un producto del carrito.
 * @access  Private
 */
router.delete('/:productoId', auth, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.user.id);
        usuario.carrito = usuario.carrito.filter(i => i.producto.toString() !== req.params.productoId);
        await usuario.save();
        res.json({ mensaje: 'Producto eliminado del carrito' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar del carrito.' });
    }
});

module.exports = router;