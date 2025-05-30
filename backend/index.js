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
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const port = 4550;
const JWT_SECRET = 'secreto-super-seguro';

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

function soloAdmin(req, res, next) {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ mensaje: 'Acceso restringido a administradores' });
  }
  next();
}

app.use('/auth', rutasAuth);
app.use('/resenas', rutasResenas);

app.get('/', (req, res) => {
  res.send('¡Bienvenido al catálogo de productos!');
});

app.get('/productos', async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (error) {
    res.status(500).send('Error al obtener productos');
  }
});

app.post('/productos', verificarToken, soloAdmin, upload.single('imagen'), async (req, res) => {
  try {
    const { nombre, precio, descripcion, stock } = req.body;
    const imagen = req.file ? '/uploads/' + req.file.filename : null;

    const nuevoProducto = new Producto({ nombre, precio, descripcion, stock, imagen });
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(400).send('Error al crear producto');
  }
});

app.get('/productos/:id', async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).send('Producto no encontrado');
    res.json(producto);
  } catch (error) {
    res.status(500).send('Error al obtener producto');
  }
});

app.put('/productos/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const { nombre, precio, descripcion, stock } = req.body;
    const producto = await Producto.findByIdAndUpdate(req.params.id, { nombre, precio, descripcion, stock }, { new: true });
    if (!producto) return res.status(404).send('Producto no encontrado');
    res.json(producto);
  } catch (error) {
    res.status(400).send('Error al actualizar producto');
  }
});

app.delete('/productos/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).send('Producto no encontrado');
    res.status(204).send();
  } catch (error) {
    res.status(500).send('Error al eliminar producto');
  }
});

app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});
