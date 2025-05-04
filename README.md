# 🧪 Guía de Pruebas - Catálogo de Productos

Este proyecto es una aplicación web completa que permite:

- Registro e inicio de sesión con roles (admin y visitante)
- CRUD de productos (solo para admin)
- Subida de imágenes
- Gestión de stock
- Sistema de reseñas (comentario + calificación)
- Promedio de puntuación por producto

---

## ✅ Requisitos

- Node.js y npm instalados
- MongoDB local ejecutándose (`mongod`)
- Navegador web moderno
- Visual Studio Code (opcional)

---

## 🚀 Cómo ejecutar

1. Clona o descomprime el proyecto.
2. Abre una terminal en la carpeta raíz (`catalogo-productos`).
3. Ejecuta:

```bash
npm install express mongoose cors bcryptjs jsonwebtoken multer
```

4. En una terminal separada, ejecuta MongoDB:

```bash
mongod
```

5. En otra terminal:

```bash
cd backend
node index.js
```

6. Abre el archivo `public/index.html` en tu navegador.

---

## 🧩 Flujo de Pruebas

### 1. Registro de un administrador

- Nombre: `Admin`
- Correo: `admin@test.com`
- Contraseña: `admin123`
- Rol: `Administrador`

Haz clic en **Registrar**, luego inicia sesión con los mismos datos.

---

### 2. Crear un producto

- Nombre: `Laptop Gamer`
- Precio: `3500`
- Descripción: `Laptop con GPU RTX`
- Stock: `10`
- Imagen: Subir un .jpg/.png < 2MB

Haz clic en **Guardar**. El producto aparecerá en la lista.

---

### 3. Editar y eliminar producto

- Usa los botones **Editar** o **Eliminar** al lado del producto.
- Modifica valores y vuelve a guardar.

---

### 4. Registro de un visitante

- Nombre: `Usuario`
- Correo: `usuario@test.com`
- Contraseña: `usuario123`
- Rol: `Visitante`

Haz clic en **Registrar**, luego inicia sesión como visitante.

---

### 5. Agregar reseña

- Haz clic en el producto para mostrar su detalle.
- Baja hasta **Reseñas**.
- Escribe un comentario y selecciona una puntuación.
- Clic en **Enviar Reseña**.

Verás tu reseña en la lista y el **promedio de estrellas** actualizado.

---

## ✅ Funcionalidades completadas

| Función                        | Estado |
|-------------------------------|--------|
| Registro/Login con roles      | ✅      |
| CRUD de productos             | ✅      |
| Gestión de stock              | ✅      |
| Subida de imágenes            | ✅      |
| Sistema de reseñas            | ✅      |

---

¡Listo para probar y extender! 🎉
