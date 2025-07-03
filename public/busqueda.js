/**
 * @file Contiene la lógica para la página de búsqueda de productos.
 * @description Maneja la carga de categorías, la validación de filtros y la ejecución de la búsqueda contra la API.
 */

/** @constant {string} API - La URL base de la API del backend. */
const API = 'http://localhost:4550';

/** @type {string[]} - Almacena las categorías de productos cargadas desde la API. */
let categorias = [];

/**
 * Carga las categorías de productos desde la API y las puebla en el elemento select del DOM.
 * @async
 * @returns {Promise<void>}
 */
async function cargarCategorias() {
  try {
    const res = await fetch(API + '/productos');
    const productos = await res.json();
    // Filtra para obtener categorías únicas y no nulas
    categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))];
    const select = document.getElementById('busquedaCategoria');
    categorias.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar categorías:", error);
    alert("No se pudieron cargar las categorías.");
  }
}

/**
 * Valida los campos de filtro de precio antes de realizar la búsqueda.
 * @returns {boolean} `true` si la validación es exitosa, `false` en caso contrario.
 */
function validarBusqueda() {
  const precioMin = document.getElementById('precioMin').value;
  const precioMax = document.getElementById('precioMax').value;
  let errores = [];
  if (precioMin && (isNaN(precioMin) || Number(precioMin) < 0)) {
    errores.push('Precio mínimo inválido.');
  }
  if (precioMax && (isNaN(precioMax) || Number(precioMax) < 0)) {
    errores.push('Precio máximo inválido.');
  }
  if (precioMin && precioMax && Number(precioMin) > Number(precioMax)) {
    errores.push('El precio mínimo no puede ser mayor que el máximo.');
  }
  if (errores.length) {
    alert(errores.join('\n'));
    return false;
  }
  return true;
}

/**
 * Realiza una búsqueda de productos aplicando los filtros y muestra los resultados en la tabla.
 * Si no hay resultados, muestra un mensaje informativo.
 * @async
 * @returns {Promise<void>}
 */
async function buscar() {
  if (!validarBusqueda()) return;
  const nombre = document.getElementById('busquedaNombre').value.toLowerCase();
  const categoria = document.getElementById('busquedaCategoria').value;
  const precioMin = parseFloat(document.getElementById('precioMin').value);
  const precioMax = parseFloat(document.getElementById('precioMax').value);

  try {
    const res = await fetch(API + '/productos');
    const productos = await res.json();
    const filtrados = productos.filter(p => {
      let ok = true;
      if (nombre && !p.nombre.toLowerCase().includes(nombre)) ok = false;
      if (categoria && p.categoria !== categoria) ok = false;
      if (!isNaN(precioMin) && p.precio < precioMin) ok = false;
      if (!isNaN(precioMax) && p.precio > precioMax) ok = false;
      return ok;
    });
    const tabla = document.getElementById('resultados');
    tabla.innerHTML = '';

    if (filtrados.length === 0) {
      tabla.innerHTML = '<tr><td colspan="5" style="text-align:center;">No se encontraron productos con los filtros seleccionados.</td></tr>';
    } else {
      filtrados.forEach(p => {
        tabla.innerHTML += `<tr>
          <td>${escapeHtml(p.nombre)}</td>
          <td>${escapeHtml(p.categoria || '')}</td>
          <td>${p.precio}</td>
          <td>${p.stock}</td>
          <td>${escapeHtml(p.descripcion || '')}</td>
        </tr>`;
      });
    }
  } catch (error) {
    console.error("Error al buscar productos:", error);
    alert("Ocurrió un error al realizar la búsqueda.");
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

// Inicialización al cargar la página
cargarCategorias();
buscar();
