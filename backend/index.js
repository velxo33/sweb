require('./db');

const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const Producto = require('./models/producto');
const { validationResult } = require('express-validator');
const validarProducto = require('./validators/producto-validator');
const rutasAuth = require('./routes/auth');
const rutasResenas = require('./routes/resenas');
const upload = require('./middleware-multer');

const app = express();
const port = 4550;
const JWT_SECRET = process.env.JWT_SECRET || 'secreto-super-seguro';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '../public')));

// Middleware para verificar token JWT
function verificarToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ mensaje: 'Token requerido' });

  try {
    const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token inválido' });
  }
}

// Middleware para verificar rol admin
function soloAdmin(req, res, next) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso restringido a administradores' });
  }
  next();
}

// Middleware para requerir autenticación en HTML
function requireAuthHtml(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.redirect('/login');
  try {
    const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.redirect('/login');
  }
}

// Limitar intentos de login y registro
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 intentos por IP
  message: { mensaje: 'Demasiados intentos, intenta más tarde.' }
});

// Rutas
const productosRoutes = require('./routes/productos');
const favoritosRouter = require('./routes/favoritos');
const carritoRouter = require('./routes/carrito');
app.use('/auth', rutasAuth);
app.use('/resenas', rutasResenas);
app.use('/favoritos', favoritosRouter);
app.use('/carrito', carritoRouter);

// Ruta principal
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});
app.get('/catalogo', requireAuthHtml, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/catalogo.html'));
});
app.get('/favoritos', requireAuthHtml, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/favoritos.html'));
});
app.get('/busqueda', requireAuthHtml, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/busqueda.html'));
});
app.get('/reseñas', requireAuthHtml, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/reseñas.html'));
});

// Usar el router de productos
app.use('/productos', productosRoutes);

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});

