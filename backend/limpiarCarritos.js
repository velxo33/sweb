const mongoose = require('mongoose');

// Reemplaza esta URI por la de tu MongoDB Atlas
const uri = "mongodb+srv://anthony926v:tony123V@cluster0.qwwi7aj.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";
;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Conectado a MongoDB Atlas');

    // Limpia todos los carritos que tengan producto como string (ej: "finalizar")
    const res = await mongoose.connection.db.collection('usuarios').updateMany(
      {},
      { $pull: { carrito: { $or: [ { producto: { $type: "string" } }, { producto: { $exists: false } } ] } } }
    );

    console.log('Carritos corruptos limpiados:', res.modifiedCount);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error al conectar o limpiar:', err);
    mongoose.disconnect();
  });