
    const API = 'http://localhost:4550';
    const token = localStorage.getItem('token');
    const productoId = new URLSearchParams(window.location.search).get('productoId');

    async function cargarReseñas() {
      const promRes = await fetch(`${API}/resenas/${productoId}/promedio`);
      const { promedio } = await promRes.json();
      document.getElementById('promedio-calificacion').innerText = `Promedio: ${promedio} ★`;

      const listaRes = await fetch(`${API}/resenas/${productoId}`);
      const reseñas = await listaRes.json();
      const ul = document.getElementById('lista-reseñas');
      ul.innerHTML = '';
      reseñas.forEach(r => {
        ul.innerHTML += `<li><strong>${escapeHtml(r.usuario.nombre)}</strong>: ${r.estrellas}★ - ${escapeHtml(r.comentario)}</li>`;
      });
    }

    function validarResena() {
      const comentario = document.getElementById('comentario').value.trim();
      const estrellas = document.getElementById('estrellas').value;
      let errores = [];
      if (comentario.length < 5 || comentario.length > 200) errores.push('El comentario debe tener entre 5 y 200 caracteres.');
      if (!estrellas || isNaN(estrellas) || estrellas < 1 || estrellas > 5) errores.push('Selecciona una calificación válida.');
      if (errores.length) {
        alert(errores.join('\n'));
        return false;
      }
      return true;
    }

    async function enviarReseña() {
      if (!validarResena()) return;
      const comentario = document.getElementById('comentario').value;
      const estrellas = document.getElementById('estrellas').value;
      await fetch(`${API}/resenas/${productoId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ comentario, estrellas })
      });
      document.getElementById('comentario').value = '';
      cargarReseñas();
    }

    function escapeHtml(text) {
      return String(text).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[m]));
    }

    cargarReseñas();
  