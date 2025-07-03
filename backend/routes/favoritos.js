/**
 * @file Contiene las rutas de la API para la gestión de favoritos.
 * @description Define endpoints para ver, agregar y eliminar productos de la lista de favoritos de un usuario.
 * @requires express
 * @requires ../models/usuario
 * @requires jsonwebtoken
 */

const express = require('express');
const Usuario = require('../models/usuario');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto-super-seguro';

/**
 * Middleware de autenticación para proteger las rutas de favoritos.
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
 * @route   GET /favoritos
 * @desc    Obtiene la lista de favoritos del usuario autenticado.
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.user.id).populate('favoritos');
        res.json(usuario.favoritos);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener favoritos.' });
    }
});

/**
 * @route   POST /favoritos/:id
 * @desc    Agrega un producto a la lista de favoritos.
 * @access  Private
 */
router.post('/:id', auth, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.user.id);
        // Evita duplicados
        if (!usuario.favoritos.includes(req.params.id)) {
            usuario.favoritos.push(req.params.id);
            await usuario.save();
        }
        res.status(200).json({ mensaje: 'Favorito agregado' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al agregar favorito.' });
    }
});

/**
 * @route   DELETE /favoritos/:id
 * @desc    Elimina un producto de la lista de favoritos.
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.user.id);
        usuario.favoritos = usuario.favoritos.filter(fav => fav.toString() !== req.params.id);
        await usuario.save();
        res.json({ mensaje: 'Favorito eliminado' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar favorito.' });
    }
});

module.exports = router;