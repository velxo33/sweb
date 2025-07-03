/**
 * @file Contiene la lógica para la página de Login y Registro.
 * @description Maneja la validación de formularios y la comunicación con la API para autenticar y registrar usuarios.
 */

/** @constant {string} API - La URL base de la API del backend. */
const API = 'http://localhost:4550';

/**
 * Valida si una cadena de texto tiene un formato de email válido.
 * @param {string} email - El email a validar.
 * @returns {boolean} `true` si el email es válido, `false` en caso contrario.
 */
function validarEmail(email) {
  // Expresión regular simple para validación de formato de email.
  return /^[^@]+@[^@]+\.[a-zA-Z]{2,}$/.test(email);
}

/**
 * Muestra un mensaje de estado (error o éxito) en el DOM.
 * @param {string} msg - El mensaje a mostrar.
 * @param {string} [tipo='error'] - El tipo de mensaje ('error' o 'success') para aplicar la clase CSS correspondiente.
 */
function mostrarEstado(msg, tipo = 'error') {
  const estado = document.getElementById('estado-login');
  estado.innerText = msg;
  estado.className = tipo;
  estado.scrollIntoView({
    behavior: 'smooth'
  });
}

/**
 * Procesa el formulario de registro, valida los datos y los envía a la API.
 * @async
 * @returns {Promise<void>}
 */
async function registrar() {
  const nombre = document.getElementById('reg-nombre').value.trim();
  const correo = document.getElementById('reg-correo').value.trim();
  const clave = document.getElementById('reg-clave').value;
  const rol = document.getElementById('rol').value;
  let errores = [];

  if (nombre.length < 2 || nombre.length > 50) errores.push('El nombre debe tener entre 2 y 50 caracteres.');
  if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ ]+$/.test(nombre)) errores.push('El nombre solo puede contener letras y espacios.');
  if (!validarEmail(correo)) errores.push('Correo inválido.');
  if (clave.length < 8 || clave.length > 32) errores.push('La contraseña debe tener entre 8 y 32 caracteres.');

  if (errores.length) {
    mostrarEstado(errores.join('\n'));
    return;
  }

  try {
    const res = await fetch(API + '/auth/registro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre,
        correo,
        contraseña: clave,
        rol
      })
    });
    const data = await res.json();
    if (res.ok) {
      mostrarEstado(data.mensaje || 'Registrado correctamente. Ahora puedes iniciar sesión.', 'success');
      document.getElementById('reg-nombre').value = '';
      document.getElementById('reg-correo').value = '';
      document.getElementById('reg-clave').value = '';
    } else {
      // Muestra errores específicos del backend si existen.
      const errorMsg = data.errores ? data.errores.map(e => e.msg).join(', ') : data.mensaje;
      mostrarEstado(errorMsg || 'Error al registrar');
    }
  } catch (error) {
    console.error("Error en registrar:", error);
    mostrarEstado("Ocurrió un error de conexión.");
  }
}

/**
 * Procesa el formulario de login, valida los datos y los envía a la API para autenticación.
 * @async
 * @returns {Promise<void>}
 */
async function login() {
  const correo = document.getElementById('login-correo').value.trim();
  const clave = document.getElementById('login-clave').value;
  let errores = [];
  if (!validarEmail(correo)) errores.push('Correo inválido.');
  if (clave.length < 8 || clave.length > 32) errores.push('La contraseña debe tener entre 8 y 32 caracteres.');

  if (errores.length) {
    mostrarEstado(errores.join('\n'));
    return;
  }

  try {
    const res = await fetch(API + '/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        correo,
        contraseña: clave
      })
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('rol', data.rol);
      localStorage.setItem('nombre', data.nombre);
      window.location.href = 'catalogo.html';
    } else {
      mostrarEstado(data.mensaje || 'Error en login');
    }
  } catch (error) {
    console.error("Error en login:", error);
    mostrarEstado("Ocurrió un error de conexión.");
  }
}
