/**
 * @file Contiene la lógica para la página de reseñas de un producto.
 * @description Carga las reseñas existentes, calcula el promedio y permite a los usuarios enviar nuevas reseñas.
 */

/** @constant {string} API - La URL base de la API del backend. */
const API = 'http://localhost:4550';
/** @constant {string|null} token - El token de autenticación JWT del usuario. */
const token = localStorage.getItem('token');
/** @constant {string|null} productoId - El ID del producto obtenido de los parámetros de la URL. */
const productoId = new URLSearchParams(window.location.search).get('productoId');

/**
 * Carga las reseñas y el promedio de calificación de un producto y las muestra en el DOM.
 * @async
 * @returns {Promise<void>}
 */
async function cargarReseñas() {
  if (!productoId) {
    document.body.innerHTML = '<h1>Producto no especificado.</h1>';
    return;
  }
  try {
    // Cargar promedio
    const promRes = await fetch(`${API}/resenas/${productoId}/promedio`);
    const {
      promedio
    } = await promRes.json();
    document.getElementById('promedio-calificacion').innerText = `Promedio: ${promedio} ★`;

    // Cargar lista de reseñas
    const listaRes = await fetch(`${API}/resenas/${productoId}`);
    const reseñas = await listaRes.json();
    const ul = document.getElementById('lista-reseñas');
    ul.innerHTML = '';
    reseñas.forEach(r => {
      ul.innerHTML += `<li><strong>${escapeHtml(r.usuario.nombre)}</strong>: ${r.estrellas}★ - ${escapeHtml(r.comentario)}</li>`;
    });
  } catch (error) {
    console.error("Error al cargar reseñas:", error);
    alert("No se pudieron cargar las reseñas.");
  }
}

/**
 * Valida el formulario de nueva reseña.
 * @returns {boolean} `true` si los datos son válidos, `false` en caso contrario.
 */
function validarResena() {
  const comentario = document.getElementById('comentario').value.trim();
  const estrellas = document.getElementById('estrellas').value;
  let errores = [];
  if (comentario.length < 5 || comentario.length > 200) {
    errores.push('El comentario debe tener entre 5 y 200 caracteres.');
  }
  if (!estrellas || isNaN(estrellas) || estrellas < 1 || estrellas > 5) {
    errores.push('Selecciona una calificación válida.');
  }
  if (errores.length) {
    alert(errores.join('\n'));
    return false;
  }
  return true;
}

/**
 * Envía una nueva reseña a la API.
 * @async
 * @returns {Promise<void>}
 */
async function enviarReseña() {
  if (!token) {
    alert("Debes iniciar sesión para dejar una reseña.");
    return;
  }
  if (!validarResena()) return;

  const comentario = document.getElementById('comentario').value;
  const estrellas = document.getElementById('estrellas').value;

  try {
    const res = await fetch(`${API}/resenas/${productoId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        comentario,
        estrellas
      })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.mensaje || "Error del servidor");
    }
    document.getElementById('comentario').value = '';
    cargarReseñas();
  } catch (error) {
    console.error("Error al enviar reseña:", error);
    alert("No se pudo enviar la reseña: " + error.message);
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

// Carga inicial de reseñas.
cargarReseñas();
