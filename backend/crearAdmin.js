const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Usuario = require('./models/usuario');

async function crearAdmin() {
    await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    const correo = 'admin@admin.com';
    const nombre = 'Administrador';
    const contraseña = 'admin123'; // Cambia esto por una contraseña segura

    // Verifica si ya existe un admin
    const existe = await Usuario.findOne({ correo });
    if (existe) {
        console.log('El administrador ya existe.');
        process.exit();
    }

    const hash = await bcrypt.hash(contraseña, 10);

    const admin = new Usuario({
        nombre,
        correo,
        contraseña: hash,
        rol: 'admin'
    });

    await admin.save();
    console.log('Administrador creado correctamente.');
    process.exit();
}

crearAdmin();