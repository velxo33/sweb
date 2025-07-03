/**
 * @file Contiene la lógica para la página del catálogo de productos.
 * @description Gestiona la visualización de productos, la interacción con favoritos y carrito, y el CRUD de productos para administradores.
 */

/** @constant {string} API - La URL base de la API del backend. */
const API = 'http://localhost:4550';
/** @constant {string|null} token - El token de autenticación JWT del usuario. */
const token = localStorage.getItem('token');
/** @constant {string|null} rol - El rol del usuario autenticado. */
const rol = localStorage.getItem('rol');

/** @type {string|null} - Almacena el ID del producto que se está editando. */
let editandoId = null;
/** @type {string[]} - Almacena los IDs de los productos favoritos del usuario. */
let favoritosUsuario = [];

// Redirige al login si no hay token.
if (!token) {
  alert('Inicia sesión para acceder al catálogo');
  window.location.href = 'login.html';
}

/**
 * Cierra la sesión del usuario eliminando los datos de localStorage y redirigiendo al login.
 */
function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('rol');
  window.location.href = 'login.html';
}

/**
 * Obtiene la lista de IDs de productos favoritos del usuario desde la API.
 * @async
 * @returns {Promise<void>}
 */
async function obtenerFavoritosUsuario() {
  try {
    const res = await fetch(API + '/favoritos', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    if (!res.ok) throw new Error('Error al obtener favoritos');
    const favoritos = await res.json();
    favoritosUsuario = favoritos.map(f => f._id);
  } catch (error) {
    console.error("Error en obtenerFavoritosUsuario:", error);
  }
}

/**
 * Agrega o quita un producto de la lista de favoritos del usuario.
 * @async
 * @param {string} id - El ID del producto.
 * @returns {Promise<void>}
 */
async function toggleFavorito(id) {
  try {
    const method = favoritosUsuario.includes(id) ? 'DELETE' : 'POST';
    await fetch(`${API}/favoritos/${id}`, {
      method,
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    // Actualiza la lista de favoritos y recarga los productos para reflejar el cambio.
    await obtenerFavoritosUsuario();
    cargarProductos();
  } catch (error) {
    console.error("Error en toggleFavorito:", error);
    alert("No se pudo actualizar la lista de favoritos.");
  }
}

/**
 * Carga todos los productos desde la API y los muestra en la tabla.
 * @async
 * @returns {Promise<void>}
 */
async function cargarProductos() {
  await obtenerFavoritosUsuario();
  try {
    const res = await fetch(API + '/productos');
    const productos = await res.json();
    const tabla = document.getElementById('tabla-productos');
    tabla.innerHTML = '';
    productos.forEach(p => {
      const esFavorito = favoritosUsuario.includes(p._id);
      tabla.innerHTML += `
        <tr>
          <td>${p.imagen ? `<img src="http://localhost:4550${escapeHtml(p.imagen)}" alt="producto" width="50">` : ''}</td>
          <td>${escapeHtml(p.nombre)}</td>
          <td>${p.precio}</td>
          <td>${escapeHtml(p.descripcion)}</td>
          <td>${p.stock <= 0 ? 'Agotado' : p.stock}</td>
          <td>
            ${rol === 'admin' ? `<button onclick="editarProducto('${p._id}')">Editar</button><button onclick="eliminarProducto('${p._id}')">Eliminar</button>` : ''}
            <button onclick="verDetalles('${p._id}')">Ver Detalles</button>
            <button onclick="toggleFavorito('${p._id}')" class="${esFavorito ? 'btn-fav-active' : 'btn-fav'}">${esFavorito ? '★ Favorito' : '☆ Favorito'}</button>
            <!-- <button onclick="agregarAlCarrito('${p._id}')">Agregar al carrito</button> -->
          </td>
        </tr>`;
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
    alert("No se pudieron cargar los productos.");
  }
}

/**
 * Redirige a la página de detalles y reseñas de un producto.
 * @param {string} id - El ID del producto.
 */
function verDetalles(id) {
  window.location.href = `reseñas.html?productoId=${id}`;
}

/**
 * Agrega un producto al carrito de compras.
 * @async
 * @param {string} productoId - El ID del producto a agregar.
 * @returns {Promise<void>}
 */
async function agregarAlCarrito(productoId) {
  try {
    const res = await fetch(`${API}/carrito/${productoId}`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cantidad: 1
      })
    });
    const data = await res.json();
    alert(data.mensaje);
  } catch (error) {
    console.error("Error al agregar al carrito:", error);
    alert("No se pudo agregar el producto al carrito.");
  }
}

/**
 * Elimina un producto de la base de datos (solo para administradores).
 * @async
 * @param {string} id - El ID del producto a eliminar.
 * @returns {Promise<void>}
 */
async function eliminarProducto(id) {
  if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return;
  try {
    await fetch(`${API}/productos/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    cargarProductos();
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    alert('Error al eliminar producto');
  }
}

/**
 * Carga los datos de un producto en el formulario para su edición (solo para administradores).
 * @async
 * @param {string} id - El ID del producto a editar.
 * @returns {Promise<void>}
 */
async function editarProducto(id) {
  try {
    const res = await fetch(`${API}/productos/${id}`);
    const p = await res.json();
    document.getElementById('nombre').value = p.nombre;
    document.getElementById('precio').value = p.precio;
    document.getElementById('descripcion').value = p.descripcion;
    document.getElementById('stock').value = p.stock;
    document.getElementById('categoria').value = p.categoria || '';
    editandoId = p._id;
    document.getElementById('form-container').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error("Error al cargar producto para editar:", error);
    alert('Error al cargar producto');
  }
}

/**
 * Escapa caracteres HTML de una cadena de texto para prevenir ataques XSS.
 * @param {string} text - El texto a sanitizar.
 * @returns {string} El texto sanitizado.
 */
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  } [m]));
}

// Asigna el evento de submit al formulario de productos.
document.getElementById('formulario').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const url = editandoId ? `${API}/productos/${editandoId}` : `${API}/productos`;
  const method = editandoId ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': 'Bearer ' + token
      },
      body: formData
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.mensaje || 'Error en el servidor');
    }
    e.target.reset();
    editandoId = null;
    cargarProductos();
  } catch (err) {
    console.error("Error al guardar producto:", err);
    alert('Error al guardar producto: ' + err.message);
  }
});

// Muestra el formulario de productos si el usuario es administrador.
if (rol === 'admin') {
  document.getElementById('form-container').style.display = 'block';
}

// Carga inicial de productos.
cargarProductos();