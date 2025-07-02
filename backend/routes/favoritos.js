const express = require('express');
const Usuario = require('../models/usuario');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto-super-seguro';

// Middleware para autenticar
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

// Obtener favoritos del usuario
router.get('/', auth, async (req, res) => {
    const usuario = await Usuario.findById(req.user.id).populate('favoritos');
    res.json(usuario.favoritos);
});

// Agregar un favorito
router.post('/:id', auth, async (req, res) => {
    const usuario = await Usuario.findById(req.user.id);
    if (!usuario.favoritos.includes(req.params.id)) {
        usuario.favoritos.push(req.params.id);
        await usuario.save();
    }
    res.json({ mensaje: 'Favorito agregado' });
});

// Quitar un favorito
router.delete('/:id', auth, async (req, res) => {
    const usuario = await Usuario.findById(req.user.id);
    usuario.favoritos = usuario.favoritos.filter(fav => fav.toString() !== req.params.id);
    await usuario.save();
    res.json({ mensaje: 'Favorito eliminado' });
});

module.exports = router;