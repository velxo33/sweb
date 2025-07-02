const API = 'http://localhost:4550';
const token = localStorage.getItem('token');
const rol = localStorage.getItem('rol');
let editandoId = null;
let favoritosUsuario = [];

if (!token) {
  alert('Inicia sesión para acceder al catálogo');
  window.location.href = 'login.html';
}

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('rol');
  window.location.href = 'login.html';
}

async function obtenerFavoritosUsuario() {
  const res = await fetch(API + '/favoritos', {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  favoritosUsuario = (await res.json()).map(f => f._id);
}

async function toggleFavorito(id) {
  if (favoritosUsuario.includes(id)) {
    await fetch(API + '/favoritos/' + id, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    });
  } else {
    await fetch(API + '/favoritos/' + id, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token }
    });
  }
  await obtenerFavoritosUsuario();
  cargarProductos();
}
window.toggleFavorito = toggleFavorito;

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
          <td>${p.imagen ? `<img src="http://localhost:4550${escapeHtml(p.imagen)}" alt="producto">` : ''}</td>
          <td>${escapeHtml(p.nombre)}</td>
          <td>${p.precio}</td>
          <td>${escapeHtml(p.descripcion)}</td>
          <td>${p.stock <= 0 ? 'Agotado' : p.stock}</td>
          <td>
            ${rol === 'admin' ? `<button onclick="editarProducto('${p._id}')">Editar</button><button onclick="eliminarProducto('${p._id}')">Eliminar</button>` : ''}
            <button onclick="verDetalles('${p._id}')">Ver Detalles</button>
            <button onclick="toggleFavorito('${p._id}')" style="background:${esFavorito ? '#ffc107' : '#007bff'};color:#fff;">${esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}</button>
            <button onclick="agregarAlCarrito('${p._id}')">Agregar al carrito</button>
          </td>
        </tr>`;
    });
  } catch (error) {
    alert('Error al cargar productos');
  }
}

function verDetalles(id) {
  window.location.href = `reseñas.html?productoId=${id}`;
}

document.getElementById('formulario').addEventListener('submit', async (e) => {
  e.preventDefault();
  let errores = [];
  const nombre = document.getElementById('nombre').value.trim();
  const precio = document.getElementById('precio').value;
  const descripcion = document.getElementById('descripcion').value.trim();
  const stock = document.getElementById('stock').value;
  const categoria = document.getElementById('categoria').value.trim();

  if (nombre.length < 2 || nombre.length > 50) errores.push('El nombre debe tener entre 2 y 50 caracteres.');
  if (!precio || isNaN(precio) || Number(precio) < 0) errores.push('El precio debe ser un número positivo.');
  if (descripcion.length > 200) errores.push('La descripción debe tener máximo 200 caracteres.');
  if (!stock || isNaN(stock) || Number(stock) < 0) errores.push('El stock debe ser un número positivo.');
  if (categoria.length < 2 || categoria.length > 30) errores.push('La categoría debe tener entre 2 y 30 caracteres.');

  if (errores.length) {
    alert(errores.join('\n'));
    return false;
  }

  const formData = new FormData(formulario);
  formData.set('categoria', categoria);
  const url = editandoId ? `${API}/productos/${editandoId}` : `${API}/productos`;
  const method = editandoId ? 'PUT' : 'POST';
  try {
    const response = await fetch(url, { method, headers: { Authorization: 'Bearer ' + token }, body: formData });
    if (!response.ok) {
      const data = await response.json();
      if (data.errores && Array.isArray(data.errores)) {
        alert('Errores:\n' + data.errores.map(e => e.msg).join('\n'));
      } else if (data.mensaje) {
        alert('Error: ' + data.mensaje);
      } else {
        alert('Error desconocido al guardar producto');
      }
      return;
    }
    formulario.reset();
    editandoId = null;
    cargarProductos();
  } catch (err) {
    alert('Error al guardar producto');
  }
});

async function eliminarProducto(id) {
  try {
    await fetch(`${API}/productos/${id}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
    cargarProductos();
  } catch {
    alert('Error al eliminar producto');
  }
}

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
  } catch {
    alert('Error al cargar producto');
  }
}

async function agregarAlCarrito(productoId) {
  const res = await fetch(API + '/carrito/' + productoId, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ cantidad: 1 })
  });
  const data = await res.json();
  alert(data.mensaje);
}
window.agregarAlCarrito = agregarAlCarrito;

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

if (rol === 'admin') document.getElementById('form-container').style.display = 'block';
cargarProductos();