require('./db');

const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

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

// Rutas
const productosRoutes = require('./routes/productos');
app.use('/auth', rutasAuth);
app.use('/resenas', rutasResenas);

// Ruta principal
app.get('/', (req, res) => {
  res.send('¡Bienvenido al catálogo de productos!');
});


// Usar el router de productos
app.use('/productos', productosRoutes);

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});
