require('./db');

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

const Producto = require('./models/producto');
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
app.use('/auth', rutasAuth);
app.use('/resenas', rutasResenas);

// Ruta principal
app.get('/', (req, res) => {
  res.send('¡Bienvenido al catálogo de productos!');
});

// Obtener todos los productos
app.get('/productos', async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos' });
  }
});

// Crear producto
app.post('/productos', verificarToken, soloAdmin, upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, precio, descripcion, stock } = req.body;
    const imagen = req.file ? '/uploads/' + req.file.filename : null;

    const nuevoProducto = new Producto({ nombre, precio, descripcion, stock, imagen });
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear producto' });
  }
});

// Obtener producto por ID
app.get('/productos/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener producto' });
  }
});

// Actualizar producto por ID
app.put('/productos/:id', verificarToken, soloAdmin, upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, precio, descripcion, stock } = req.body;
    const datosActualizados = { nombre, precio, descripcion, stock };

    if (req.file) {
      datosActualizados.imagen = '/uploads/' + req.file.filename;
    }

    const producto = await Producto.findByIdAndUpdate(req.params.id, datosActualizados, { new: true });
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar producto' });
  }
});

// Eliminar producto por ID
app.delete('/productos/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar producto' });
  }
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});
