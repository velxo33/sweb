
    const API = 'http://localhost:4550';
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Inicia sesión para acceder al carrito');
      window.location.href = 'login.html';
    }

    function cerrarSesion() {
      localStorage.removeItem('token');
      localStorage.removeItem('rol');
      window.location.href = 'login.html';
    }

    async function cargarCarrito() {
      const res = await fetch(API + '/carrito', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const carrito = await res.json();
      const tabla = document.getElementById('tabla-carrito');
      tabla.innerHTML = '';
      let total = 0;
      carrito.forEach(item => {
        const subtotal = item.producto.precio * item.cantidad;
        total += subtotal;
        tabla.innerHTML += `
          <tr>
            <td>${item.producto.imagen ? `<img src="http://localhost:4550${escapeHtml(item.producto.imagen)}" alt="producto">` : ''}</td>
            <td>${escapeHtml(item.producto.nombre)}</td>
            <td>${item.producto.precio}</td>
            <td>
              <input type="number" min="1" value="${item.cantidad}" style="width:50px;" onchange="cambiarCantidad('${item.producto._id}', this.value)">
            </td>
            <td>${subtotal}</td>
            <td>
              <button onclick="eliminarDelCarrito('${item.producto._id}')">Eliminar</button>
            </td>
          </tr>
        `;
      });
      document.getElementById('total-carrito').textContent = total;
    }

    async function eliminarDelCarrito(productoId) {
      await fetch(API + '/carrito/' + productoId, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      cargarCarrito();
    }

    async function cambiarCantidad(productoId, cantidad) {
      if (cantidad < 1 || isNaN(cantidad)) {
        alert('La cantidad debe ser un número mayor a 0.');
        return;
      }
      await fetch(API + '/carrito/' + productoId, {
        method: 'PUT',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad })
      });
      cargarCarrito();
    }

    document.getElementById('finalizar-btn').onclick = async function() {
      if (!confirm('¿Estás seguro de finalizar la compra?')) return;
      const res = await fetch(API + '/carrito/finalizar', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const data = await res.json();
      alert(data.mensaje);
      cargarCarrito();
      window.location.href = 'catalogo.html';
    };

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

    cargarCarrito();
    window.eliminarDelCarrito = eliminarDelCarrito;
    window.cambiarCantidad = cambiarCantidad;
