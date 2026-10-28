/* ==========================================================================
   Lodgy · Lógica de login
   Solo HTML, CSS y JavaScript puro. Sin librerías.
   ==========================================================================
*/

(function() {
  "use strict";

  // Verificar si ya hay sesión
  function verificarSesionExistente() {
    const token = localStorage.getItem("token");
    const usuarioStr = localStorage.getItem("usuario");
    
    if (token && usuarioStr) {
      try {
        const usuario = JSON.parse(usuarioStr);
        if (usuario.rol === "Servicios generales" || usuario.rol === "Administrador") {
          window.location.href = "trabajo.html";
        }
      } catch (e) {
        // Si hay error, continuar con login
      }
    }
  }

  // Mostrar mensaje de error
  function mostrarError(mensaje) {
    const mensajeDiv = document.getElementById("mensajeLogin");
    mensajeDiv.textContent = mensaje;
    mensajeDiv.className = "mensaje-login error";
  }

  // Limpiar mensaje
  function limpiarMensaje() {
    const mensajeDiv = document.getElementById("mensajeLogin");
    mensajeDiv.textContent = "";
    mensajeDiv.className = "mensaje-login";
  }

  // Inicializar
  function inicializar() {
    verificarSesionExistente();
    
    const formLogin = document.getElementById("formLogin");
    const btnLogin = document.getElementById("btnLogin");
    
    formLogin.addEventListener("submit", async function(e) {
      e.preventDefault();
      
      limpiarMensaje();
      
      const correo = document.getElementById("correo").value.trim();
      const contrasena = document.getElementById("contrasena").value.trim();
      
      if (!correo || !contrasena) {
        mostrarError("Correo o contraseña incorrectos");
        return;
      }
      
      btnLogin.disabled = true;
      btnLogin.textContent = "Iniciando sesión...";
      
      try {
        const respuesta = await window.LodgyAPI.login(correo, contrasena);
        
        // Verificar rol
        if (respuesta.usuario.rol !== "Servicios generales" && respuesta.usuario.rol !== "Administrador") {
          mostrarError("Correo o contraseña incorrectos");
          btnLogin.disabled = false;
          btnLogin.textContent = "Iniciar sesión";
          return;
        }
        
        // Guardar en localStorage
        localStorage.setItem("token", respuesta.token);
        localStorage.setItem("usuario", JSON.stringify(respuesta.usuario));
        
        // Redirigir
        window.location.href = "trabajo.html";
        
      } catch (error) {
        mostrarError("Correo o contraseña incorrectos");
        btnLogin.disabled = false;
        btnLogin.textContent = "Iniciar sesión";
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializar);
  } else {
    inicializar();
  }

})();
