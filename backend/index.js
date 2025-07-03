/**
 * @file Archivo principal del servidor backend.
 * @description Configura y arranca el servidor Express, define middlewares globales, rutas estáticas y manejo de errores.
 */

require('./db'); // Inicializa la conexión a la base de datos.
require('dotenv').config(); // Carga las variables de entorno.

const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Importación de rutas
const rutasAuth = require('./routes/auth');
const rutasResenas = require('./routes/resenas');
const productosRoutes = require('./routes/productos');
const favoritosRouter = require('./routes/favoritos');
const carritoRouter = require('./routes/carrito');

const app = express();
const port = process.env.PORT || 4550;
const JWT_SECRET = process.env.JWT_SECRET || 'secreto-super-seguro';

// --- Middlewares Globales ---
app.use(cors()); // Habilita CORS para todas las rutas.
app.use(express.json()); // Parsea cuerpos de solicitud JSON.
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Sirve archivos estáticos de la carpeta 'uploads'.
app.use(express.static(path.join(__dirname, '../public'))); // Sirve el frontend estático.

/**
 * Middleware para verificar el token JWT en las cabeceras de autorización.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 * @param {function} next - La función para pasar al siguiente middleware.
 */
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({
    mensaje: 'Token requerido'
  });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      mensaje: 'Token inválido'
    });
  }
}

/**
 * Middleware para verificar si el usuario autenticado tiene el rol de 'admin'.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 * @param {function} next - La función para pasar al siguiente middleware.
 */
function soloAdmin(req, res, next) {
  if (req.usuario && req.usuario.rol === 'admin') {
    next();
  } else {
    res.status(403).json({
      mensaje: 'Acceso restringido a administradores'
    });
  }
}

/**
 * Middleware para proteger rutas HTML que requieren autenticación.
 * Redirige a /login si el token no es válido.
 * @param {object} req - El objeto de solicitud de Express.
 * @param {object} res - El objeto de respuesta de Express.
 * @param {function} next - La función para pasar al siguiente middleware.
 */
function requireAuthHtml(req, res, next) {
  // Esta función es un ejemplo, pero la autenticación de páginas estáticas
  // debería manejarse en el frontend verificando el token en localStorage.
  // La lógica del backend no puede leer directamente el localStorage del cliente.
  next();
}

// --- Rate Limiting ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo 10 peticiones por IP en la ventana de tiempo
  message: {
    mensaje: 'Demasiados intentos desde esta IP, por favor intente de nuevo después de 15 minutos.'
  }
});

// --- Definición de Rutas de la API ---
app.use('/auth', authLimiter, rutasAuth); // Aplica rate limiting a las rutas de autenticación.
app.use('/resenas', rutasResenas);
app.use('/favoritos', favoritosRouter);
app.use('/carrito', carritoRouter);
app.use('/productos', productosRoutes);

// --- Rutas para servir archivos HTML ---
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// Las siguientes rutas sirven los archivos HTML directamente.
// La protección de estas rutas se maneja en el JS de cada página.
app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  if (page.endsWith('.html')) {
    res.sendFile(path.join(__dirname, '../public', page));
  } else {
    next();
  }
});


// --- Manejo de Errores ---
// Middleware para manejar errores no capturados.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    mensaje: 'Error interno del servidor'
  });
});

// --- Inicio del Servidor ---
app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});

