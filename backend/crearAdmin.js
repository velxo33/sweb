/**
 * @file Script para crear un usuario administrador en la base de datos.
 * @description Este script se conecta a MongoDB, verifica si ya existe un administrador y, si no, crea uno nuevo con una contraseña hasheada.
 * @requires mongoose
 * @requires bcryptjs
 * @requires dotenv
 * @requires ./models/usuario
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Usuario = require('./models/usuario');

/**
 * Función principal asíncrona que realiza la creación del administrador.
 * @async
 * @function crearAdmin
 * @returns {Promise<void>}
 */
async function crearAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const correo = 'admin@admin.com';
        const nombre = 'Administrador';
        const contraseña = 'admin123'; // ATENCIÓN: Usar una contraseña segura en un entorno real.

        // Verifica si ya existe un administrador con el mismo correo.
        const existe = await Usuario.findOne({ correo });
        if (existe) {
            console.log('El administrador ya existe.');
            process.exit();
        }

        // Hashea la contraseña antes de guardarla.
        const hash = await bcrypt.hash(contraseña, 10);

        const admin = new Usuario({
            nombre,
            correo,
            contraseña: hash,
            rol: 'admin'
        });

        await admin.save();
        console.log('Administrador creado correctamente.');
    } catch (error) {
        console.error("Error al crear el administrador:", error);
    } finally {
        // Cierra la conexión a la base de datos al finalizar.
        mongoose.disconnect();
        process.exit();
    }
}

crearAdmin();