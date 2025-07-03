# Proyecto Tienda en Línea (Sweb)

Este proyecto es una aplicación web completa para una catalogo en línea, construida con el stack MERN (MongoDB, Express, React, Node.js), aunque el frontend es con HTML/CSS/JS vanilla. Permite la gestión de productos, autenticación de usuarios, catalogo de productos, favoritos y sistema de reseñas.

## Características Principales

- **Autenticación de Usuarios:** Registro y Login con JWT (JSON Web Tokens).
- **Roles de Usuario:** Distinción entre `cliente` y `admin` con acceso restringido.
- **Gestión de Productos (Admin):** CRUD completo para productos, incluyendo subida de imágenes.
- **Catálogo y Búsqueda:** Visualización de productos con filtros por nombre, categoría y rango de precios.
- **Favoritos:** Lista de productos favoritos por usuario.
- **Reseñas y Calificaciones:** Sistema de reseñas por producto con cálculo de promedio.

## Estructura del Proyecto

```
sweb/
├── backend/         # Lógica del servidor (Node.js/Express)
│   ├── models/      # Esquemas de Mongoose para la base de datos
│   ├── routes/      # Definición de las rutas de la API
│   ├── validators/  # Reglas de validación para express-validator
│   ├── middleware-*.js # Middlewares de autenticación, admin, etc.
│   ├── uploads/     # Carpeta para imágenes de productos
│   ├── .env         # Variables de entorno (BD, secretos JWT)
│   └── index.js     # Archivo principal del servidor
│
└── public/          # Archivos estáticos del frontend
    ├── *.html       # Páginas de la aplicación
    ├── *.js         # Lógica del cliente para cada página
    └── estilo.css   # Hoja de estilos principal
```

## Instalación y Ejecución

### Prerrequisitos

- Node.js (v16 o superior) Descárgalo desde nodejs.org (se recomienda la versión LTS). Sin el chocolatey (no hacer check en la instalacion)
- (Recomendada): Usar MongoDB Atlas, que es una base de datos en la nube (es gratis para empezar). Solo necesitas registrarte en mongodb.com/atlas y crear un clúster gratuito. Al final, te darán una "cadena de conexión" (URI) que se parece a la del archivo .env.example.

### Backend

En la carpeta backend, crea una copia del archivo **backend\.env.example** y renómbrala a **.env**
Abre el nuevo archivo **.env** y asegúrate de que la variable **MONGO_URL** apunte a tu propia base de datos MongoDB (ya sea la de Atlas o la tuya local). La que está en el ejemplo es solo una muestra.
Puedes dejar el **JWT_SECRET como está para desarrollo local**.
**(Recomendado para nuevas instancias del proyecto)** Crea el usuario Administrador: El proyecto incluye un script para crear el primer usuario administrador. Asegúrate de que tu base de datos MongoDB esté corriendo


1.  Navega a la carpeta del backend:
    ```bash
    cd backend
    ```
2.  Instala las dependencias:
    ```bash
    npm install

    ├── bcryptjs@3.0.2
    ├── cors@2.8.5
    ├── dotenv@17.0.1
    ├── express-rate-limit@7.5.1
    ├── express-validator@7.2.1
    ├── express@5.1.0
    ├── jsonwebtoken@9.0.2
    ├── mongodb@6.17.0
    ├── mongoose@8.16.1
    └── multer@1.4.5-lts.2

    ```
3.  Crea un archivo `.env` basado en el `.env.example` y configura tus variables (`MONGO_URL`, `JWT_SECRET`).
4.  (Opcional) Ejecuta el script para crear un usuario administrador pero debes tener corriendo el Mongo:
    ```bash
    node crearAdmin.js
    ```
5.  Inicia el servidor:
    ```bash
    node index.js
    ```
    El servidor se ejecutará en `http://localhost:4550`. Siempre en la pagina de login.

---