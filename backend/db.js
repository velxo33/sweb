/**
 * @file Módulo de conexión a la base de datos MongoDB.
 * @description Configura y establece la conexión con MongoDB Atlas usando Mongoose.
 * @requires dotenv
 * @requires mongoose
 */

require('dotenv').config();
const mongoose = require('mongoose');

const url = process.env.MONGO_URL;

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch(err => console.error('Error al conectar a MongoDB Atlas:', err));

module.exports = mongoose;
