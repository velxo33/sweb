
    const API = 'http://localhost:4550';
    let categorias = [];
    async function cargarCategorias() {
      const res = await fetch(API + '/productos');
      const productos = await res.json();
      categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))];
      const select = document.getElementById('busquedaCategoria');
      categorias.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
      });
    }
    function validarBusqueda() {
      const precioMin = document.getElementById('precioMin').value;
      const precioMax = document.getElementById('precioMax').value;
      let errores = [];
      if (precioMin && (isNaN(precioMin) || Number(precioMin) < 0)) errores.push('Precio mínimo inválido.');
      if (precioMax && (isNaN(precioMax) || Number(precioMax) < 0)) errores.push('Precio máximo inválido.');
      if (precioMin && precioMax && Number(precioMin) > Number(precioMax)) errores.push('El precio mínimo no puede ser mayor que el máximo.');
      if (errores.length) {
        alert(errores.join('\n'));
        return false;
      }
      return true;
    }
    async function buscar() {
      if (!validarBusqueda()) return;
      const nombre = document.getElementById('busquedaNombre').value.toLowerCase();
      const categoria = document.getElementById('busquedaCategoria').value;
      const precioMin = parseFloat(document.getElementById('precioMin').value);
      const precioMax = parseFloat(document.getElementById('precioMax').value);
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
      filtrados.forEach(p => {
        tabla.innerHTML += `<tr>
    <td>${escapeHtml(p.nombre)}</td>
    <td>${escapeHtml(p.categoria||'')}</td>
    <td>${p.precio}</td>
    <td>${p.stock}</td>
    <td>${escapeHtml(p.descripcion||'')}</td>
  </tr>`;
      });
    }
    function escapeHtml(text) {
      return String(text).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[m]));
    }
    cargarCategorias();
    buscar();
