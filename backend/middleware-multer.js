/**
 * @file Configuración del middleware Multer para la subida de archivos.
 * @description Define el almacenamiento en disco, el nombrado de archivos y el filtro por tipo de archivo para las imágenes de productos.
 * @requires fs
 * @requires multer
 * @requires path
 */

const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Define la ruta absoluta a la carpeta 'uploads'.
const uploadDir = path.join(__dirname, 'uploads');

// Crea la carpeta 'uploads' si no existe.
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * @const {object} storage - Configuración de almacenamiento para Multer.
 * @description Define el destino y el nombre de los archivos subidos.
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    // Genera un nombre de archivo único usando la fecha actual.
    const filename = Date.now() + ext;
    cb(null, filename);
  }
});

/**
 * Filtra los archivos subidos para permitir solo imágenes.
 * @param {object} req - El objeto de solicitud.
 * @param {object} file - El objeto de archivo subido.
 * @param {function} cb - El callback para indicar si el archivo es aceptado.
 */
function fileFilter(req, file, cb) {
  const tiposPermitidos = /jpeg|jpg|png/;
  const ext = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
  const mime = tiposPermitidos.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (jpeg, jpg, png).'));
  }
}

/**
 * @const {object} upload - Instancia de Multer configurada.
 * @description Middleware listo para ser usado en las rutas que manejan subida de archivos.
 */
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 2 }, // Límite de 2MB por archivo.
  fileFilter: fileFilter
});

module.exports = upload;
