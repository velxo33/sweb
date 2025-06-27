const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/catalogo-productos', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Conectado a MongoDB');
})
.catch((err) => {
  console.error('Error al conectar a MongoDB:', err);
});
