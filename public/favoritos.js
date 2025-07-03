/**
 * @file Contiene la lógica para la página de "Mis Favoritos".
 * @description Carga y muestra la lista de productos favoritos de un usuario y permite eliminarlos.
 */

/** @constant {string} API - La URL base de la API del backend. */
const API = 'http://localhost:4550';
/** @constant {string|null} token - El token de autenticación JWT del usuario. */
const token = localStorage.getItem('token');

/**
 * Carga la lista de productos favoritos del usuario desde la API y los muestra en la tabla.
 * @async
 * @returns {Promise<void>}
 */
async function cargarFavoritos() {
  if (!token) {
    document.getElementById('tabla-favoritos').innerHTML = '<tr><td colspan="6">Debes iniciar sesión para ver tus favoritos.</td></tr>';
    return;
  }
  try {
    const resFav = await fetch(API + '/favoritos', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    if (!resFav.ok) throw new Error('Error al cargar favoritos');
    const favoritos = await resFav.json();
    const tabla = document.getElementById('tabla-favoritos');
    tabla.innerHTML = '';

    if (!favoritos.length) {
      tabla.innerHTML = '<tr><td colspan="6">No tienes productos favoritos.</td></tr>';
      return;
    }

    favoritos.forEach(p => {
      tabla.innerHTML += `<tr>
          <td>${escapeHtml(p.nombre)}</td>
          <td>${escapeHtml(p.categoria || '')}</td>
          <td>${p.precio}</td>
          <td>${p.stock}</td>
          <td>${escapeHtml(p.descripcion || '')}</td>
          <td><button onclick="quitarFavorito('${p._id}')">Quitar</button></td>
        </tr>`;
    });
  } catch (error) {
    console.error("Error en cargarFavoritos:", error);
    alert("No se pudieron cargar los favoritos.");
  }
}

/**
 * Elimina un producto de la lista de favoritos del usuario.
 * @async
 * @param {string} id - El ID del producto a eliminar de favoritos.
 * @returns {Promise<void>}
 */
async function quitarFavorito(id) {
  if (!confirm("¿Quitar este producto de tus favoritos?")) return;
  try {
    await fetch(API + '/favoritos/' + id, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    cargarFavoritos();
  } catch (error) {
    console.error("Error en quitarFavorito:", error);
    alert("No se pudo quitar el favorito.");
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

// Carga inicial de favoritos.
cargarFavoritos();
