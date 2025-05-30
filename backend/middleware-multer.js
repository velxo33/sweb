const fs = require('fs');
const multer = require('multer');
const path = require('path');

// Ruta absoluta a la carpeta uploads
const uploadDir = path.join(__dirname, 'uploads');

// Verificar si la carpeta existe, si no, crearla
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración del almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    cb(null, filename);
  }
});

// Filtro para validar tipo de archivo
function fileFilter(req, file, cb) {
  const tiposPermitidos = /jpeg|jpg|png/;
  const ext = tiposPermitidos.test(path.extname(file.originalname).toLowerCase());
  const mime = tiposPermitidos.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'));
  }
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 2 }, // 2MB
  fileFilter: fileFilter
});

module.exports = upload;
