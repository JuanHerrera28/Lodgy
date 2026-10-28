/* ==========================================================================
   Lodgy · Lógica de la pantalla táctil de operaciones
   Solo HTML, CSS y JavaScript puro. Sin librerías.
   ==========================================================================
*/

(function() {
  "use strict";

  // Variables globales
  let temporizadorActualizar = null;
  let temporizadoresBotones = {}; // Para el segundo toque de confirmación

  // Verificar sesión al cargar
  function verificarSesion() {
    const token = sessionStorage.getItem("token");
    const usuarioStr = sessionStorage.getItem("usuario");
    
    if (!token) {
      window.location.href = "../login.html";
      return null;
    }
    
    try {
      const usuario = JSON.parse(usuarioStr);
      if (usuario.rol !== "Servicios generales" && usuario.rol !== "Administrador") {
        window.location.href = "../login.html";
        return null;
      }
      return usuario;
    } catch (e) {
      window.location.href = "../login.html";
      return null;
    }
  }

  // Formatear fecha a DD/MM/AAAA
  function formatearFecha(fechaStr) {
    try {
      // fechaStr viene como "2026-10-25 09:16:30"
      const fecha = new Date(fechaStr.replace(' ', 'T'));
      const dia = String(fecha.getDate()).padStart(2, '0');
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const anio = fecha.getFullYear();
      return dia + '/' + mes + '/' + anio;
    } catch (e) {
      return fechaStr;
    }
  }

  // Calcular "hace X horas/días"
  function haceCuantoTiempo(fechaStr) {
    try {
      const fecha = new Date(fechaStr.replace(' ', 'T'));
      const ahora = new Date();
      const diferenciaMs = ahora - fecha;
      const diferenciaHoras = Math.floor(diferenciaMs / (1000 * 60 * 60));
      const diferenciaDias = Math.floor(diferenciaHoras / 24);
      
      if (diferenciaDias > 0) {
        return "hace " + diferenciaDias + (diferenciaDias === 1 ? " día" : " días");
      } else if (diferenciaHoras > 0) {
        return "hace " + diferenciaHoras + (diferenciaHoras === 1 ? " hora" : " horas");
      } else {
        const diferenciaMinutos = Math.floor(diferenciaMs / (1000 * 60));
        if (diferenciaMinutos > 0) {
          return "hace " + diferenciaMinutos + (diferenciaMinutos === 1 ? " minuto" : " minutos");
        } else {
          return "hace un momento";
        }
      }
    } catch (e) {
      return "";
    }
  }

  // Mostrar mensaje
  function mostrarMensaje(texto, tipo) {
    const contenedor = document.getElementById("mensajesContenedor");
    const mensaje = document.createElement("div");
    mensaje.className = tipo === "exito" ? "mensaje mensaje-exito" : "mensaje mensaje-error";
    mensaje.textContent = texto;
    mensaje.setAttribute("role", "status");
    
    contenedor.appendChild(mensaje);
    
    // Desaparece solo a los 5 segundos
    setTimeout(function() {
      if (mensaje.parentNode) {
        mensaje.parentNode.removeChild(mensaje);
      }
    }, 5000);
  }

  // Actualizar hora
  function actualizarHora() {
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    document.getElementById("actualizadoA").textContent = "Actualizado a las " + horas + ":" + minutos;
  }

  // Cargar y mostrar trabajo
  async function cargarTrabajo() {
    const estadoCarga = document.getElementById("estadoCarga");
    const seccionCabanas = document.getElementById("seccionCabanas");
    const seccionDanos = document.getElementById("seccionDanos");
    
    try {
      const datos = await window.LodgyAPI.obtenerTrabajo();
      
      // Ocultar carga
      estadoCarga.style.display = "none";
      seccionCabanas.style.display = "block";
      seccionDanos.style.display = "block";
      
      // Mostrar cabañas por limpiar
      const listaCabanas = document.getElementById("listaCabanas");
      const contadorCabanas = document.getElementById("contadorCabanas");
      const sinCabanas = document.getElementById("sinCabanas");
      
      listaCabanas.innerHTML = "";
      const cabanas = datos.cabanas_por_limpiar || [];
      contadorCabanas.textContent = cabanas.length;
      
      if (cabanas.length === 0) {
        sinCabanas.style.display = "block";
      } else {
        sinCabanas.style.display = "none";
        cabanas.forEach(function(cabana) {
          const tarjeta = document.createElement("div");
          tarjeta.className = "tarjeta-cabana";
          
          const nombre = document.createElement("div");
          nombre.className = "tarjeta-cabana-nombre";
          nombre.textContent = cabana.nombre; // Usar textContent
          
          const btnListo = document.createElement("button");
          btnListo.className = "btn btn-grande";
          btnListo.textContent = "Listo";
          btnListo.setAttribute("data-id", cabana.id_cabana);
          btnListo.setAttribute("data-tipo", "cabana");
          btnListo.setAttribute("aria-label", "Marcar " + cabana.nombre + " como lista");
          
          btnListo.addEventListener("click", function() {
            manejarBotonConfirmacion(btnListo, function() {
              marcarCabanaComoLista(cabana.id_cabana, btnListo);
            });
          });
          
          tarjeta.appendChild(nombre);
          tarjeta.appendChild(btnListo);
          listaCabanas.appendChild(tarjeta);
        });
      }
      
      // Mostrar daños pendientes
      const listaDanos = document.getElementById("listaDanos");
      const contadorDanos = document.getElementById("contadorDanos");
      const sinDanos = document.getElementById("sinDanos");
      
      listaDanos.innerHTML = "";
      const danos = datos.ordenes_pendientes || [];
      contadorDanos.textContent = danos.length;
      
      if (danos.length === 0) {
        sinDanos.style.display = "block";
      } else {
        sinDanos.style.display = "none";
        danos.forEach(function(dano) {
          const tarjeta = document.createElement("div");
          tarjeta.className = "tarjeta-dano";
          
          const cabanaNombre = document.createElement("div");
          cabanaNombre.className = "tarjeta-dano-cabana";
          cabanaNombre.textContent = dano.cabana; // Usar textContent
          
          const descripcion = document.createElement("div");
          descripcion.className = "tarjeta-dano-descripcion";
          descripcion.textContent = dano.descripcion; // Usar textContent
          
          const info = document.createElement("div");
          info.className = "tarjeta-dano-info";
          
          const estado = document.createElement("span");
          estado.className = "tarjeta-dano-estado";
          estado.textContent = dano.estado;
          
          const tiempo = document.createElement("span");
          tiempo.textContent = haceCuantoTiempo(dano.fecha_reporte);
          
          info.appendChild(estado);
          info.appendChild(tiempo);
          
          const btnResolver = document.createElement("button");
          btnResolver.className = "btn btn-grande";
          btnResolver.textContent = "Resolver";
          btnResolver.setAttribute("data-id", dano.id_mantenimiento);
          btnResolver.setAttribute("data-tipo", "mantenimiento");
          btnResolver.setAttribute("aria-label", "Resolver daño en " + dano.cabana);
          
          btnResolver.addEventListener("click", function() {
            manejarBotonConfirmacion(btnResolver, function() {
              resolverDano(dano.id_mantenimiento, btnResolver);
            });
          });
          
          tarjeta.appendChild(cabanaNombre);
          tarjeta.appendChild(descripcion);
          tarjeta.appendChild(info);
          tarjeta.appendChild(btnResolver);
          listaDanos.appendChild(tarjeta);
        });
      }
      
      actualizarHora();
      
    } catch (error) {
      estadoCarga.textContent = "Error al cargar los datos";
      mostrarMensaje(error.message || "Error al cargar", "error");
    }
  }

  // Manejar botón con segundo toque de confirmación
  function manejarBotonConfirmacion(boton, callback) {
    const id = boton.getAttribute("data-id") + "_" + boton.getAttribute("data-tipo");
    
    if (temporizadoresBotones[id]) {
      // Segundo toque - confirmar
      clearTimeout(temporizadoresBotones[id]);
      delete temporizadoresBotones[id];
      callback();
    } else {
      // Primer toque - mostrar confirmación
      const textoOriginal = boton.textContent;
      boton.textContent = "¿Confirmar?";
      boton.setAttribute("aria-label", "Confirmar acción");
      
      temporizadoresBotones[id] = setTimeout(function() {
        boton.textContent = textoOriginal;
        boton.setAttribute("aria-label", textoOriginal);
        delete temporizadoresBotones[id];
      }, 4000);
    }
  }

  // Marcar cabaña como lista
  async function marcarCabanaComoLista(idCabana, boton) {
    const textoOriginal = boton.textContent;
    boton.disabled = true;
    boton.textContent = "Enviando...";
    
    try {
      await window.LodgyAPI.marcarCabanaLista(idCabana);
      mostrarMensaje("Cabaña marcada como lista", "exito");
      // Recargar lista
      cargarTrabajo();
    } catch (error) {
      boton.disabled = false;
      boton.textContent = textoOriginal;
      if (error.message.includes("No tienes permisos")) {
        mostrarMensaje("No tienes permisos para esta acción", "error");
      } else {
        mostrarMensaje(error.message || "Error al marcar como lista", "error");
      }
    }
  }

  // Resolver daño
  async function resolverDano(idMantenimiento, boton) {
    const textoOriginal = boton.textContent;
    boton.disabled = true;
    boton.textContent = "Enviando...";
    
    try {
      await window.LodgyAPI.resolverMantenimiento(idMantenimiento);
      mostrarMensaje("Daño resuelto", "exito");
      // Recargar lista
      cargarTrabajo();
    } catch (error) {
      boton.disabled = false;
      boton.textContent = textoOriginal;
      if (error.message.includes("No tienes permisos")) {
        mostrarMensaje("No tienes permisos para esta acción", "error");
      } else if (error.message.includes("409") || error.message.toLowerCase().includes("resuelta")) {
        mostrarMensaje(error.message || "Ya estaba resuelta", "error");
      } else {
        mostrarMensaje(error.message || "Error al resolver", "error");
      }
    }
  }

  // Cargar lista de cabañas para el formulario
  async function cargarCabanasFormulario() {
    const select = document.getElementById("selectCabana");
    try {
      const cabanas = await window.LodgyAPI.obtenerCabanas();
      select.innerHTML = "";
      cabanas.forEach(function(cabana) {
        const option = document.createElement("option");
        option.value = cabana.id_cabana;
        option.textContent = cabana.nombre; // Usar textContent
        select.appendChild(option);
      });
    } catch (error) {
      mostrarMensaje("Error al cargar cabañas", "error");
    }
  }

  // Abrir panel de reporte
  function abrirPanelReporte() {
    document.getElementById("panelReporte").classList.add("activo");
    document.getElementById("descripcionDano").value = "";
    document.getElementById("bloqueaCabana").checked = false;
    document.getElementById("contadorActual").textContent = "0";
    document.getElementById("btnEnviarReporte").disabled = false;
    document.getElementById("btnEnviarReporte").textContent = "Enviar";
    cargarCabanasFormulario();
    // Enfocar en descripción
    setTimeout(function() {
      document.getElementById("descripcionDano").focus();
    }, 100);
  }

  // Cerrar panel de reporte
  function cerrarPanelReporte() {
    document.getElementById("panelReporte").classList.remove("activo");
  }

  // Enviar reporte
  async function enviarReporte() {
    const idCabana = document.getElementById("selectCabana").value;
    const descripcion = document.getElementById("descripcionDano").value.trim();
    const bloqueaCabana = document.getElementById("bloqueaCabana").checked;
    
    if (!descripcion) {
      mostrarMensaje("La descripción es obligatoria", "error");
      document.getElementById("descripcionDano").focus();
      return;
    }
    
    if (descripcion.length > 300) {
      mostrarMensaje("La descripción no puede exceder 300 caracteres", "error");
      return;
    }
    
    const btnEnviar = document.getElementById("btnEnviarReporte");
    btnEnviar.disabled = true;
    btnEnviar.textContent = "Enviando...";
    
    try {
      await window.LodgyAPI.reportarMantenimiento({
        id_cabana: parseInt(idCabana),
        descripcion: descripcion,
        bloquea_cabana: bloqueaCabana
      });
      
      mostrarMensaje("Daño reportado correctamente", "exito");
      cerrarPanelReporte();
      cargarTrabajo();
      
    } catch (error) {
      btnEnviar.disabled = false;
      btnEnviar.textContent = "Enviar";
      if (error.message.includes("No tienes permisos")) {
        mostrarMensaje("No tienes permisos para esta acción", "error");
      } else {
        mostrarMensaje(error.message || "Error al reportar", "error");
      }
    }
  }

  // Inicializar
  function inicializar() {
    const usuario = verificarSesion();
    if (!usuario) return;
    
    // Mostrar nombre de usuario
    document.getElementById("nombreUsuario").textContent = usuario.nombre || "Usuario";
    
    // Botón cerrar sesión
    document.getElementById("btnCerrarSesion").addEventListener("click", function() {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("usuario");
      window.location.href = "../login.html";
    });
    
    // Botón actualizar
    document.getElementById("btnActualizar").addEventListener("click", function() {
      cargarTrabajo();
    });
    
    // Botón reportar daño
    document.getElementById("btnReportarDano").addEventListener("click", abrirPanelReporte);
    
    // Panel reporte
    document.getElementById("btnCancelarReporte").addEventListener("click", cerrarPanelReporte);
    document.getElementById("btnEnviarReporte").addEventListener("click", enviarReporte);
    
    // Contador de caracteres
    document.getElementById("descripcionDano").addEventListener("input", function() {
      const contador = this.value.length;
      document.getElementById("contadorActual").textContent = contador;
    });
    
    // Cerrar panel al hacer click fuera
    document.getElementById("panelReporte").addEventListener("click", function(e) {
      if (e.target.id === "panelReporte") {
        cerrarPanelReporte();
      }
    });
    
    // Cargar datos iniciales
    actualizarHora();
    cargarTrabajo();
    
    // Actualizar cada 45 segundos
    temporizadorActualizar = setInterval(cargarTrabajo, 45000);
    
    // Actualizar hora cada minuto
    setInterval(actualizarHora, 60000);
  }

  // Iniciar cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializar);
  } else {
    inicializar();
  }

})();
